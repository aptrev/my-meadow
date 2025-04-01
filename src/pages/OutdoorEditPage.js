// Uses tutorials from https://konvajs.org/docs/.
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Stage, Layer, Rect, Transformer, Image } from 'react-konva';
import { useImage } from 'react-konva-utils';
import Plot from '../components/Plot'
import GardenNavbar from '../components/GardenNavbar';
import Sidebar from '../components/Sidebar';
import Colors from '../utilities/Colors'
import { useNavigate } from "react-router-dom";

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import 'bootstrap/dist/css/bootstrap.css';

import '../style/outdooredit.css';

const Konva = window.Konva;

const init_garden = {
    location: 'outdoor',
    width: 10,
    height: 10,
    dimensions_units: 'ft',
    stage: {
        width: 700,
        height: 700
    },
    plots: [
        {
            id: 'plot-0',
            shape: 'circle',
            name: 'plot',
            plant: 0,
            x: 100,
            y: 100,
            radius: 50,
            width: 100,
            height: 100,
            draggable: true
        },
        {
            id: 'plot-1',
            shape: 'circle',
            name: 'plot',
            plant: 0,
            x: 200,
            y: 200,
            radius: 50,
            width: 100,
            height: 100,
            draggable: true
        },
        {
            id: 'plot-2',
            shape: 'circle',
            name: 'plot',
            plant: 0,
            x: 300,
            y: 300,
            radius: 50,
            width: 100,
            height: 100,
            draggable: true
        },
        {
            id: 'plot-3',
            shape: 'circle',
            name: 'plot',
            plant: 0,
            x: 400,
            y: 400,
            radius: 50,
            width: 100,
            height: 100,
            draggable: true
        },
        {
            id: 'plot-4',
            shape: 'circle',
            name: 'plot',
            plant: 0,
            x: 500,
            y: 500,
            radius: 50,
            width: 100,
            height: 100,
            draggable: true
        }
    ],
    plants: [
        {
            id: 1473,
            name: "Marigold",
        },
        {
            id: 324,
            name: 'Magnolia',
        },
        {
            id: 1194,
            name: 'Begonia',
        },
        {
            id: 6791,
            name: 'Rose',
        }
    ]
}

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
    const [garden, setGarden] = useState(init_garden);
    const [showSidebar, setShowSidebar] = useState(false);
    const [plots, setPlots] = useState(init_garden.plots);
    const [history, setHistory] = useState([JSON.stringify(init_garden.plots)]);
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
    const [plant, setPlant] = useState('');
    const plantRef = useRef('');
    const species = plant_species;
    const navigate = useNavigate();

    const loadSelectedGarden = () => {
        // const gardens = JSON.parse(localStorage.getItem("gardens")) || [];
        // const selectedId = JSON.parse(localStorage.getItem("selectedGardenId"));
        // const selected = gardens.find(g => g.id === selectedId);
        // setGarden(selected);
    };

    // Responsive canvas
    const sceneWidth = garden.stage.width;
    const sceneHeight = garden.stage.height;
    const [stageSize, setStageSize] = useState({
        width: sceneWidth,
        height: sceneHeight,
        scale: 1
    });
    const containerRef = useRef(null);

    const updateSize = useCallback(() => {
        if (!stageRef.current) return;

        // Get container width
        const containerWidth = containerRef.current.offsetWidth;

        // Calculate scale
        const scale = containerWidth / sceneWidth;

        // Update state with new dimensions
        setStageSize({
            width: sceneWidth * scale,
            height: sceneHeight * scale,
            scale: scale
        });
    }, [sceneWidth, sceneHeight]);

    useEffect(() => {
        // Add white paper background for stage.
        if (containerRef.current) {
            const container = stageRef.current.container();
            container.style.backgroundColor = 'white';
            // container.style.width = '700px';
        }

        loadSelectedGarden();
    }, []);

    // Update stage size on window resize
    useEffect(() => {
        updateSize();
        window.addEventListener('resize', updateSize);

        return () => {
            window.removeEventListener('resize', updateSize);
        };
    }, [updateSize]);

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

    const handleDragStart = (src) => {
        setPlant(src);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();

        if (!plant || !stageRef.current) return;

        const stage = stageRef.current;

        stage.setPointersPositions(e);
        const position = stage.getPointerPosition();

        // Add new image to the list
        // setImages([
        //     ...images,
        //     {
        //         src: dragImageSrc,
        //         x: position.x,
        //         y: position.y,
        //         id: Date.now().toString()
        //     }
        // ]);
    };

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
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    }

    const handleUndo = () => {
        if (historyStep === 0) return;
        const newStep = historyStep - 1;
        setHistoryStep(newStep);
        setPlots(JSON.parse(history[newStep]));
    }

    const handleRedo = () => {
        if (historyStep === history.length - 1) return;
        const newStep = historyStep + 1;
        setHistoryStep(newStep);
        setPlots(JSON.parse(history[newStep]));
    };

    const handleSave = () => {
        navigate("/outdoor/");
    }

    return (
        <div className="app">
            <GardenNavbar onGardenChange={loadSelectedGarden} onSidebarToggle={() => setShowSidebar(true)} isEditing={true} onSave={handleSave} />
            <Sidebar show={showSidebar} onClose={() => setShowSidebar(false)} />
            <div ref={containerRef} style={{ width: '100%', height: '100%', backgroundColor: Colors.lightGreen }}>
                <div style={{ marginBottom: '10px' }}>
                    <button onClick={handleUndo}>Undo</button>
                    <button onClick={handleRedo}>Redo</button>
                </div>
                <ButtonGroup className='d-flex flex-row justify-content-center g-2' style={{ width: '100%', marginBottom: '10px' }}>
                    {plant_species.map((plant, index) =>
                        <Button
                            className='plant-button d-flex flex-column justify-content-center align-items-center flex-fill'
                            style={{ backgroundColor: plant.color, height: '50px' }}
                            type="input"
                            id={"plant-" + index}
                            onClick={(e) => handleAssign(plant.id)}
                        >
                            <img
                                key={plant.id}
                                alt={plant.name}
                                src={require('../images/' + plant.src)}
                                draggable="true"
                                onDragStart={(e) => { plantRef.current = e.target.src; }}

                                style={{ height: '100%' }}
                            />
                        </Button>
                    )}
                </ButtonGroup>
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
                            const { shape, plant, ...restProps } = plot;
                            return (
                                <Plot shape={shape} shapeProps={restProps} plant={plant} plant_species={species} onDragEnd={handleDragEnd} plotRefs={plotRefs} />
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
    )
}