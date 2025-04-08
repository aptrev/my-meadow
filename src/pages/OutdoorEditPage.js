// Uses tutorials from https://konvajs.org/docs/.
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import { useParams } from "react-router-dom";
import Plot from '../components/Plot'
import { retrieveGarden } from '../utilities/FirebaseUtils';
import { newCircle, newRect, newStar } from '../utilities/Shapes';

import { PlusCircle, Flower2, XLg, CircleSquare } from 'react-bootstrap-icons';
import Container from 'react-bootstrap/Container'
import AppContainer from "../components/AppContainer";
import OutdoorToolbar from "../components/OutdoorToolbar";
import marigold from '../assets/images/marigold.png'
import magnolia from '../assets/images/magnolia.png'
import begonia from '../assets/images/begonia.png'
import rose from '../assets/images/rose.png'
import circle from '../assets/images/plots/circle.svg'
import square from '../assets/images/plots/square.svg'
import star from '../assets/images/plots/star.svg'

import '../style/outdooredit.css';

const Konva = window.Konva;

const plant_options = [
    {
        id: 1473,
        name: "Marigold",
        src: marigold,
        color: 'orange',
        format: 'png',
        value: 1473,
    },
    {
        id: 324,
        name: begonia,
        src: magnolia,
        color: 'beige',
        format: 'png',
        value: 324,
    },
    {
        id: 1194,
        name: 'Begonia',
        src: begonia,
        color: 'pink',
        format: 'png',
        value: 1194,
    },
    {
        id: 6791,
        name: 'Rose',
        src: rose,
        color: 'red',
        format: 'png',
        value: 6791,
    }
]

const plot_options = [
    {
        id: 'toolbar-circle-element',
        name: 'Circle',
        value: 'circle',
        src: circle,
        format: 'svg',
    },
    {
        id: 'toolbar-rect-element',
        name: 'Rectangle',
        value: 'rect',
        src: square,
        format: 'svg',
    },
    {
        id: 'toolbar-star-element',
        name: 'Star',
        value: 'star',
        src: star,
        format: 'svg',
    },
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
    const species = plant_options;
    const [sceneWidth, setSceneWidth] = useState(0);
    const [sceneHeight, setSceneHeight] = useState(0);
    const [position, setPosition] = useState({
        x: 0,
        y: 0
    });
    const containerRef = useRef(null);
    const plotRef = useRef(null);
    const plantRef = useRef(null);
    const mainLayerRef = useRef(null);
    const selectRef = useRef(null);

    useEffect(() => {
        if (id) {
            retrieveGarden(id)
                .then((data) => {
                    data.plants = plant_options;
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

    useEffect(() => {
        if (garden) {
            const wrapper = document.getElementById('stage-wrapper');
            const width = wrapper.width;
            const height = wrapper.height;
            if (width > height) {

            }
            setStageSize({
                width: garden.stage.width,
                height: garden.stage.height,
                scale: 1,
            });
        }
    }, [garden, setStageSize])

    const updateSize = useCallback(() => {
        if (!stageRef.current) return;

        // Get container dimensions
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;

        // Calculate scale
        const scale = containerWidth / sceneWidth;

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
        }
    }, [garden]);

    // // Update stage size on window resize
    useEffect(() => {
        updateSize();
        window.addEventListener('resize', updateSize);

        return () => {
            window.removeEventListener('resize', updateSize);
        };
    }, [garden, updateSize]);

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
            const newIds = [];
            setSelectedIds(newIds);
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
        console.log(pos);
        setSelectionRectangle({
            visible: true,
            x1: pos.x * (1 / stageSize.scale),
            y1: pos.y * (1 / stageSize.scale),
            x2: pos.x * (1 / stageSize.scale),
            y2: pos.y * (1 / stageSize.scale),
        });
    };

    const handleMouseMove = (e) => {
        if (!isSelecting.current) {
            return;
        }

        const pos = e.target.getStage().getPointerPosition();
        setSelectionRectangle({
            ...selectionRectangle,
            x2: pos.x * (1 / stageSize.scale),
            y2: pos.y * (1 / stageSize.scale),
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

        const nodes = plots
            .map(({ id }) => plotRefs.current.get(id))
            .filter(node => node);

        const selected = nodes.filter((node, index) => {

            return Konva.Util.haveIntersection(selBox, {
                x: node.x(),
                y: node.y(),
                width: node.width(),
                height: node.height(),
            });
        });

        setSelectedIds(selected.map(plot => plot.id()));
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

    useEffect(() => {
        if (selectedIds.length && transformerRef.current) {
            const nodes = selectedIds
                .map(id => {
                    return plotRefs.current.get(id)
                })
                .filter(node => node);

            transformerRef.current.nodes(nodes);
        } else if (transformerRef.current) {
            transformerRef.current.nodes([]);
        }
    }, [selectedIds]);

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
                    case 'star': newPlots[index] = {
                        ...newPlots[index],
                        x: node.x(),
                        y: node.y(),
                        innerRadius: node.innerRadius() * scaleX,
                        outerRadius: node.outerRadius() * scaleX,
                        rotation: node.rotation(),
                    }; break;
                    case 'circle': newPlots[index] = {
                        ...newPlots[index],
                        x: node.x(),
                        y: node.y(),
                        radius: node.radius() * scaleX,
                    }; break;
                    default: newPlots[index] = {
                        ...newPlots[index],
                        x: node.x(),
                        y: node.y(),
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(node.height() * scaleY),
                        rotation: node.rotation(),
                    };
                }

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

    const saveGarden = useCallback((plots) => {
        // For use by Save button in Header
        const newGarden = garden;
        newGarden.plots = plots;
        localStorage.setItem('savedGarden', JSON.stringify(newGarden));
    }, [garden])

    const handleUndo = useCallback((e) => {
        if (historyStep === 0) return;
        const newStep = historyStep - 1;
        setHistoryStep(newStep);
        saveGarden(JSON.parse(history[newStep]));
        setPlots(JSON.parse(history[newStep]));
    }, [history, historyStep, saveGarden])

    const handleRedo = useCallback((e) => {
        if (historyStep === history.length - 1) return;
        const newStep = historyStep + 1;
        setHistoryStep(newStep);
        saveGarden(JSON.parse(history[newStep]));
        setPlots(JSON.parse(history[newStep]));
    }, [history, historyStep, saveGarden])

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === 'z') {
                handleUndo();
            } else if (event.ctrlKey && event.shiftKey && event.key === 'Z') {
                handleRedo();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);

    const handlePlotDragStart = (e) => {
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

    const handlePlotDrag = (e) => {
        // setPosition(pos);
    }

    const handlePlotDragEnd = (e) => {

        stageRef.current.setPointersPositions(e);

        const newPlots = getNewPlot();

        setPlots(newPlots);
        saveHistory(newPlots);
    }

    const handlePlantDragStart = (e) => {
        // setPosition(pos);
    }

    const previousShape = useRef(null);
    const prevPlantColor = useRef(null);
    const handlePlantDrag = (e) => {
        stageRef.current.setPointersPositions(e);
        const pos = stageRef.current.getPointerPosition();
        if (pos) {
            const shape = stageRef.current.getIntersection(pos);
            const plant = plant_options.find((p) => p.id === plantRef.current);

            if (previousShape.current && shape) {
                if (previousShape.current !== shape) {
                    prevPlantColor.current = shape.fill()
                    shape.fill(plant.color);
                    previousShape.current = shape;
                }
            } else if (!previousShape.current && shape) {
                prevPlantColor.current = shape.fill()
                shape.fill(plant.color);
                previousShape.current = shape;
            } else if (previousShape.current && !shape) {
                previousShape.current.fill(prevPlantColor.current);
                previousShape.current = null;
            }
        }

    }

    const handlePlantDragEnd = (e) => {
        stageRef.current.setPointersPositions(e);
        const pos = stageRef.current.getPointerPosition();
        if (pos) {
            const shape = stageRef.current.getIntersection(pos);
            const plant = plant_options.find((p) => p.id === plantRef.current);
            if (shape) {
                previousShape.current = null;
                prevPlantColor.current = null
                shape.fill(plant.color);
                console.log(shape);
                const newPlots = plots.map((plot) => {
                    if (plot.id === shape.id()) {
                        const updates = {
                            plant: plantRef.current,
                            fill: plant.color,
                        }
                        return { ...plot, 
                            ...updates,
                        };
                    }
                    return plot;
                });
                plantRef.current = null;

                console.log(plots);

                setPlots(newPlots);
                saveHistory(newPlots);
            }
        }
    }

    const handleChangePlot = (plot) => {
        plotRef.current = plot;
    }

    const handleChangePlant = (plant) => {
        plantRef.current = plant;
    }

    const handleDelete = (e) => {

        const newPlots = plots.filter((plot) => !selectedIds.includes(plot.id));
        const newSelectedIds = [];
        setSelectedIds(newSelectedIds);

        setPlots(newPlots);
        saveHistory(newPlots);
    }

    const onDragEnter = (e) => {
        e.target.fill('red');
    }

    const toolbarButtons = [
        {
            id: 'toolbar-plot-button',
            value: 'plot',
            type: 'radio',
            name: 'Plots',
            options: plot_options,
            ref: plotRef,
            isDragging: false,
            onDrag: (e, pos) => handlePlotDrag(e, pos),
            onDragEnd: (e, pos) => handlePlotDragEnd(e, pos),
            onDragStart: (e, pos) => handlePlotDragStart(e, pos),
            onSelect: (plot) => handleChangePlot(plot),
            iconActive: <XLg size={24} />,
            iconDisabled: <CircleSquare size={24} />,
        },
        {
            id: 'toolbar-plant-button',
            value: 'plant',
            type: 'radio',
            name: 'Plants',
            options: plant_options,
            ref: plantRef,
            isDragging: false,
            onDrag: (e, pos) => handlePlantDrag(e, pos),
            onDragEnd: (e, pos) => handlePlantDragEnd(e, pos),
            onDragStart: (e, pos) => handlePlantDragStart(e, pos),
            onSelect: (plant) => handleChangePlant(plant),
            iconActive: <XLg size={24} />,
            iconDisabled: <Flower2 size={24} />,
        }
    ]

    const getPlants = () => {
        const plants = plots.map((plot) => plot.plant);
        return plant_options.filter((plant => plants.includes(plant.id)));
    }

    // const handlePlantClick = (plantId) => {
    //     if (selectedIds.length === 0) return;

    //     const newPlots = plots.map(plot => {
    //         if (selectedIds.includes(plot.id)) {
    //             return { ...plot, plant: plantId };
    //         }
    //         return plot;
    //     });

    //     setPlots(newPlots);
    //     saveHistory(newPlots);
    // }

    return (
        <>
            <AppContainer>
                {garden &&
                    <div style={{ width: '100%', height: '100%' }}>
                        <OutdoorToolbar
                            onUndo={handleUndo}
                            onRedo={handleRedo}
                            onDelete={handleDelete}
                            plotRef={plotRef}
                            plantRef={plantRef}
                            toolbarButtons={toolbarButtons}
                        />
                        <div id='stage-wrapper' className='mt-4'>
                            <div className='white-canvas d-flex' ref={containerRef} style={{ margin: '0 auto', width: 'fit-content', height: 'fit-content' }}>
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
                                    // onPlantClick={handlePlantClick}
                                >
                                    <Layer ref={mainLayerRef}>
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
                                                fill="var(--primaryDarkGreen)"
                                                opacity={0.25}
                                                ref={selectRef}
                                            />
                                        )}

                                    </Layer>
                                </Stage>
                            </div>
                        </div>

                        {/* <Container className='outdoor-plant-info'>
                                <p>{getPlants}</p>
                        </Container> */}
                    </div>
                }
            </AppContainer>
        </>
    )
}