// Uses tutorials from https://konvajs.org/docs/.
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import { useParams } from "react-router-dom";
import Plot from '../components/Plot'
import { retrieveGarden } from '../utilities/FirebaseUtils';
import { newCircle, newRect, newStar } from '../utilities/Shapes';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import 'bootstrap/dist/css/bootstrap.css';

import '../style/outdooredit.css';
import AppContainer from "../components/AppContainer";
import OutdoorToolbar from "../components/OutdoorToolbar";

const Konva = window.Konva;

const plant_species = [
    {
        id: 1473,
        name: "Marigold",
        src: 'marigold.png',
        color: 'orange'
    },
    {
        id: 324,
        name: 'Magnolia',
        src: 'magnolia.png',
        color: 'beige'
    },
    {
        id: 1194,
        name: 'Begonia',
        src: 'begonia.png',
        color: 'pink'
    },
    {
        id: 6791,
        name: 'Rose',
        src: 'rose.png',
        color: 'red'
    }
]

export default function OutdoorEditPage() {
    const { id } = useParams();
    const [garden, setGarden] = useState(null);
    const [plots, setPlots] = useState(null);
    const [history, setHistory] = useState([JSON.stringify(null)]);
    const [historyStep, setHistoryStep] = useState(0);
    const stageRef = useRef(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectionRectangle, setSelectionRectangle] = useState({
        visible: false,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0
    })
    const isSelecting = useRef(false);
    const transformerRef = useRef();
    const plotRefs = useRef(new Map());
    const species = plant_species;
    const [sceneWidth, setSceneWidth] = useState(0);
    const [sceneHeight, setSceneHeight] = useState(0);
    const containerRef = useRef(null);
    const plotRef = useRef(null);
    const plantRef = useRef(null);

    useEffect(() => {
        if (id) {
            console.log(id);
            retrieveGarden(id)
                .then((data) => {
                    data.plants = plant_species;
                    setPlots(data.plots);
                    setHistory([JSON.stringify(data.plots)]);
                    setGarden(data);
                });
        }
    }, [id]);

    // Responsive canvas
    const [stageSize, setStageSize] = useState({
        width: 500,
        height: 500,
        scale: 1
    });

    const updateSize = useCallback(() => {
        if (!stageRef.current) return;

        // Get container dimensions
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;

        // Calculate scale
        const scale = containerWidth / sceneWidth;

        // console.log('Width ' + containerWidth);
        // console.log('Height ' + containerHeight);

        // Update state with new dimensions
        setStageSize({
            width: sceneWidth * scale,
            height: sceneHeight * scale,
            scale: scale
        });

    }, [sceneWidth, sceneHeight]);

    // Add background color to canvas and initialize stage size of
    // garden load.
    useEffect(() => {
        if (garden) {
            setSceneWidth(garden.stage.width);
            setSceneHeight(garden.stage.height);
            setStageSize({
                width: garden.stage.width,
                height: garden.stage.height,
                scale: 1
            })
            garden.plants = plant_species;
        }
    }, [garden]);

    // Update stage size on window resize
    useEffect(() => {
        updateSize();
        window.addEventListener('resize', updateSize);

        return () => {
            window.removeEventListener('resize', updateSize);
        };
    }, [garden, updateSize]);

    // Add transformer to selected plots.
    useEffect(() => {
        if (selectedIds.length && transformerRef.current) {
            const nodes = selectedIds
                .map(id => plotRefs.current.get(id))
                .filter(node => node);

            transformerRef.current.nodes(nodes);
        } else if (transformerRef.current) {
            transformerRef.current.nodes([]);
        }
    }, [selectedIds]);

    const handleAssign = (plant_id) => {
        const nodes = transformerRef.current.nodes();
        const newPlots = [...plots];

        if (nodes.length > 0) {
            nodes.forEach(node => {
                const id = node.id();
                const index = newPlots.findIndex(plot => plot.id === id);

                if (index !== -1) {
                    newPlots[index] = {
                        ...newPlots[index],
                        plant: plant_id,
                    };
                }
            })
        }

        setPlots(newPlots);
        saveHistory(newPlots);
    }

    const handleStageClick = (e) => {
        if (selectionRectangle.visible) {
            return;
        }

        if (e.target === e.target.getStage()) {
            setSelectedIds([]);
            return;
        }

        if (!e.target.hasName('plot')) {
            return;
        }

        const clickedId = e.target.id();

        const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        const isSelected = selectedIds.includes(clickedId);

        if (!metaPressed && !isSelected) {
            setSelectedIds([clickedId]);
        } else if (metaPressed && isSelected) {
            setSelectedIds(selectedIds.filter(id => id !== clickedId));
        } else if (metaPressed && !isSelected) {
            setSelectedIds([...selectedIds, clickedId]);
        }
    };

    const handleMouseDown = (e) => {
        if (e.target !== e.target.getStage()) {
            return;
        }

        isSelecting.current = true;
        const pos = e.target.getStage().getPointerPosition();
        setSelectionRectangle({
            visible: true,
            x1: pos.x,
            y1: pos.y,
            x2: pos.x,
            y2: pos.y,
        });
    };

    const handleMouseMove = (e) => {
        if (!isSelecting.current) {
            return;
        }

        const pos = e.target.getStage().getPointerPosition();
        setSelectionRectangle({
            ...selectionRectangle,
            x2: pos.x,
            y2: pos.y,
        });
    };

    const handleMouseUp = () => {
        if (!isSelecting.current) {
            return;
        }
        isSelecting.current = false;

        setTimeout(() => {
            setSelectionRectangle({
                ...selectionRectangle,
                visible: false,
            });
        });

        const selBox = {
            x: Math.min(selectionRectangle.x1, selectionRectangle.x2),
            y: Math.min(selectionRectangle.y1, selectionRectangle.y2),
            width: Math.abs(selectionRectangle.x2 - selectionRectangle.x1),
            height: Math.abs(selectionRectangle.y2 - selectionRectangle.y1),
        };

        const selected = plots.filter(plot => {
            return Konva.Util.haveIntersection(selBox, {
                x: plot.x,
                y: plot.y,
                width: plot.width,
                height: plot.height,
            });
        });

        setSelectedIds(selected.map(rect => rect.id));
    };

    const handleDragEnd = (e) => {
        const nodes = transformerRef.current.nodes();
        const newPlots = [...plots];

        if (nodes.length > 0) {
            nodes.forEach(node => {
                const id = node.id();
                const index = newPlots.findIndex(plot => plot.id === id);

                if (index !== -1) {
                    newPlots[index] = {
                        ...newPlots[index],
                        x: node.x(),
                        y: node.y(),
                    };
                }
            })
        } else {
            const id = e.target.id();
            const index = newPlots.findIndex(plot => plot.id === id);

            if (index !== -1) {
                newPlots[index] = {
                    ...newPlots[index],
                    x: e.target.x(),
                    y: e.target.y(),
                };
            }
        }

        setPlots(newPlots);
        saveHistory(newPlots);
    }

    const handleTransformEnd = (e) => {
        const nodes = transformerRef.current.nodes();

        const newPlots = [...plots];

        nodes.forEach(node => {
            const id = node.id();
            const index = newPlots.findIndex(r => r.id === id);

            if (index !== -1) {
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();

                node.scaleX(1);
                node.scaleY(1);

                switch (newPlots[index].shape) {
                    case 'circle': newPlots[index] = {
                        ...newPlots[index],
                        x: node.x(),
                        y: node.y(),
                        radius: node.radius(),
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(node.height() * scaleY),
                    }; break;
                    default: newPlots[index] = {
                        ...newPlots[index],
                        x: node.x(),
                        y: node.y(),
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(node.height() * scaleY),
                    };
                }

                newPlots[index] = {
                    ...newPlots[index],
                    x: node.x(),
                    y: node.y(),
                    width: Math.max(5, node.width() * scaleX),
                    height: Math.max(node.height() * scaleY),
                };

            }
        });

        setPlots(newPlots);
        saveHistory(newPlots);
    };

    const saveHistory = (newPlots) => {
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(JSON.stringify(newPlots));
        saveGarden(newPlots);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    }

    const handleUndo = () => {
        if (historyStep === 0) return;
        const newStep = historyStep - 1;
        setHistoryStep(newStep);
        saveGarden(JSON.parse(history[newStep]));
        setPlots(JSON.parse(history[newStep]));
    }

    const handleRedo = () => {
        if (historyStep === history.length - 1) return;
        const newStep = historyStep + 1;
        setHistoryStep(newStep);
        saveGarden(JSON.parse(history[newStep]));
        setPlots(JSON.parse(history[newStep]));
    };

    const saveGarden = (plots) => {
        // For use by Save button in Header
        const newGarden = garden;
        newGarden.plots = plots;
        localStorage.setItem('savedGarden', JSON.stringify(newGarden));
    }

    const setPlot = (shape) => {
        plotRef.current = shape;
    }

    const setPlant = (plant) => {
        plantRef.current = plant;
    }

    const handlePlotDragStart = (e, pos) => {
        // console.log(`Start: (${pos.x}, ${pos.y})`);
    }

    const handlePlotDrag = (e, pos) => {
        // console.log(`Move: (${pos.x}, ${pos.y})`);
    }

    const getNewPlot = () => {
        var shape = null;
        switch (plotRef.current) {
            case 'rect': shape = newRect;
                break;
            case 'star': shape = newStar;
                break;
            case 'circle':
            default: shape = newCircle;
        }

        return plots.concat([{
            id: `plot-${plots.length}`,
            ...shape,
            ...stageRef.current.getPointerPosition(),
        }])
    }

    const handlePlotDragEnd = (e, pos) => {
        e.preventDefault();

        stageRef.current.setPointersPositions(e);

        const newPlots = getNewPlot();

        setPlots(newPlots);
        saveHistory(newPlots);
    }

    const handlePlantDragStart = (e, pos) => {
        // console.log(`Start: (${pos.x}, ${pos.y})`);
    }

    const handlePlantDrag = (e, pos) => {
        // console.log(`Move: (${pos.x}, ${pos.y})`);
    }

    const handlePlantDragEnd = (e, pos) => {
        e.preventDefault();

        // stageRef.current.setPointersPositions(e);

        // const newPlots = getNewPlot();

        // setPlots(newPlots);
        // saveHistory(newPlots);
    }

    const handlePlantClick = (plantId) => {
        if (selectedIds.length === 0) return;

        const newPlots = plots.map(plot => {
            if (selectedIds.includes(plot.id)) {
                return { ...plot, plant: plantId };
            }
            return plot;
        });

        setPlots(newPlots);
        saveHistory(newPlots);
    }

    return (
        <>
            <AppContainer>
                {garden &&
                    <div style={{ width: '100%', height: '100%' }}>
                        <OutdoorToolbar
                            onUndo={handleUndo}
                            onRedo={handleRedo}
                            onPlotDragStart={handlePlotDragStart}
                            onPlotDrag={handlePlotDrag}
                            onPlotDragEnd={handlePlotDragEnd}
                            plotRef={plotRef}
                            setPlot={setPlot}
                            plantRef={plantRef}
                            setPlant={setPlant}
                            onPlantDragStart={handlePlantDragStart}
                            onPlantDrag={handlePlantDrag}
                            onPlantDragEnd={handlePlantDragEnd}
                            plants={plant_species}
                            onPlantClick = {handlePlantClick}
                        />
                        <div ref={containerRef} style={{ margin: '0 auto', width: '100%', maxWidth: '600px', height: 'auto', backgroundColor: 'white' }}>
                            <Stage
                                width={stageSize.width}
                                height={stageSize.height}
                                scaleX={stageSize.scale}
                                scaleY={stageSize.scale}
                                ref={stageRef}
                                onMouseDown={handleMouseDown}
                                onMousemove={handleMouseMove}
                                onMouseup={handleMouseUp}
                                onClick={handleStageClick}
                                onTap={handleStageClick}
                            >
                                <Layer>
                                    {plots.map((plot) => {
                                        const { id, shape, plant, ...restProps } = plot;
                                        return (
                                            <Plot
                                                key={id}
                                                id={id}
                                                shape={shape}
                                                shapeProps={restProps}
                                                plant={plant}
                                                plant_species={species}
                                                onDragEnd={handleDragEnd}
                                                plotRefs={plotRefs} />
                                        )
                                    })}

                                    <Transformer
                                        ref={transformerRef}
                                        boundBoxFunc={(oldBox, newBox) => {
                                            // Limit resize
                                            if (newBox.width < 5 || newBox.height < 5) {
                                                return oldBox;
                                            }
                                            return newBox;
                                        }}
                                        onTransformEnd={handleTransformEnd}
                                    />

                                    {selectionRectangle.visible && (
                                        <Rect
                                            x={Math.min(selectionRectangle.x1, selectionRectangle.x2)}
                                            y={Math.min(selectionRectangle.y1, selectionRectangle.y2)}
                                            width={Math.abs(selectionRectangle.x2 - selectionRectangle.x1)}
                                            height={Math.abs(selectionRectangle.y2 - selectionRectangle.y1)}
                                            fill="rgba(0,0,255,0.5)"
                                        />
                                    )}
                                </Layer>
                            </Stage>
                        </div>
                    </div>
                }
            </AppContainer>
        </>
    )
}