// Uses tutorials from https://konvajs.org/docs/.
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import { useParams } from "react-router-dom";
import { retrieveGarden, updateGarden } from '../utilities/FirebaseUtils';
import { plotOptions } from '../utilities/Elements';
import Container from 'react-bootstrap/Container'
import Stack from 'react-bootstrap/Stack'

import Plot from '../components/Plot'
import OutdoorToolbar from "../components/OutdoorToolbar";
import Grid from '../components/Grid'
import marigold from '../assets/images/marigold.png'
import magnolia from '../assets/images/magnolia.png'
import begonia from '../assets/images/begonia.png'
import rose from '../assets/images/rose.png';

import '../style/outdooredit.css';
import LeftSidebar from "../components/LeftSidebar";
import ElementPicker from '../components/ElementPicker';

import { Grid3x3 } from "react-bootstrap-icons";

import {
    Shape, Circle, Arc, Ellipse, Line, Path, RegularPolygon, Ring, Star, Wedge, Image
} from 'react-konva';

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
        name: "Magnolia",
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
    const [scene, setScene] = useState({});
    const [stageSize, setStageSize] = useState({
        width: 0,
        height: 0,
        scale: 1
    });
    const containerRef = useRef(null);
    const plotRef = useRef(null);
    const plantRef = useRef(null);
    const gridLayerRef = useRef(null)
    const mainLayerRef = useRef(null);
    const selectRef = useRef(null);
    const [element, setElement] = useState(null);
    const [selectedShapes, setSelectedShapes] = useState(new Set([]));
    const [selectedElement, setSelectedElement] = useState(null);

    useEffect(() => {
        setStageSize({
            ...scene,
            scale: 1
        })
    }, [scene])

    useEffect(() => {
        if (id) {
            retrieveGarden(id)
                .then((data) => {
                    setScene({
                        width: data.stage.width,
                        height: data.stage.height,
                    });
                    data.plants = plant_options;
                    setPlots(data.plots);
                    setHistory([JSON.stringify(data.plots)]);
                    setGarden(data);
                });
        }
    }, [id]);

    // Responsive canvas
    const updateSize = useCallback(() => {
        if (!stageRef.current) return;

        if (scene && scene.width) {

            // Get container dimensions
            const containerWidth = containerRef.current.offsetWidth;
            // const containerHeight = containerRef.current.offsetHeight;

            // Calculate scale
            const scale = containerWidth / scene.width;

            // Update state with new dimensions
            setStageSize({
                width: scene.width * scale,
                height: scene.height * scale,
                scale: scale
            });
        }

    }, [scene]);

    // Update stage size on window resize
    useEffect(() => {
        updateSize();
        window.addEventListener('resize', updateSize);

        return () => {
            window.removeEventListener('resize', updateSize);
        };
    }, [updateSize]);

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

    const handleDeselect = () => {
        const newShapes = new Set([]);
        setSelectedShapes(newShapes);
        const newIds = [];
        setSelectedIds(newIds);
        return;
    }

    const handleStageClick = (e) => {
        if (selectionRectangle.visible) {
            return;
        }

        if (e.target === e.target.getStage()) {
            handleDeselect();
            return;
        }

        if (!e.target.hasName('plot')) {
            return;
        }

        const clickedId = e.target.id();

        const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        const isSelected = selectedIds.includes(clickedId);

        if (!metaPressed && !isSelected) {
            const newShapes = new Set([]);
            setSelectedIds([clickedId]);
            newShapes.add(e.target.getClassName().toLowerCase());
            setSelectedShapes(newShapes);
        } else if (metaPressed && isSelected) {
            setSelectedIds(selectedIds.filter(id => id !== clickedId));
            const newShapes = selectedShapes;
            newShapes.remove(e.target.getClassName().toLowerCase());
        } else if (metaPressed && !isSelected) {
            setSelectedIds([...selectedIds, clickedId]);
            const newShapes = selectedShapes;
            newShapes.add(e.target.getClassName().toLowerCase());
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

    const handleTransformStart = (e) => {
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

                var newPlot = newPlots[index];

                const pathScaleX = node.scaleX();
                const pathScaleY = node.scaleY();

                if (selectedShapes[index] !== 'path') {
                    node.scaleX(1);
                    node.scaleY(1);

                    newPlot = {
                        ...newPlot,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                    }

                    switch (newPlot.shape) {
                        case 'arc': newPlot = {
                            ...newPlot,
                            innerRadius: node.innerRadius() * scaleX,
                            outerRadius: node.outerRadius() * scaleX,
                            angle: node.angle(),
                        }; break;
                        case 'wedge': newPlot = {
                            ...newPlot,
                            radius: node.radius() * scaleX,
                            angle: node.angle(),
                        }; break;
                        case 'ellipse': newPlot = {
                            ...newPlot,
                            radius: {
                                x: node.radius().x * scaleX,
                                y: node.radius().y * scaleY,
                            }
                        }; break;
                        case 'path': newPlot = {
                            ...newPlot,
                            sidesX: pathScaleX * scaleX,
                            scaleY: pathScaleY * scaleY,
                        }; break;
                        case 'polygon': newPlot = {
                            ...newPlot,
                            sides: node.sides(),
                            radius: node.radius() * scaleX,
                        }; break;
                        case 'ring':
                        case 'star': newPlot = {
                            ...newPlot,
                            innerRadius: node.innerRadius() * scaleX,
                            outerRadius: node.outerRadius() * scaleX,
                        }; break;
                        case 'circle': newPlot = {
                            ...newPlot,
                            radius: Math.max(5, node.radius() * scaleX),
                        }; break;
                        default: newPlot = {
                            ...newPlot,
                            width: Math.max(5, node.width() * scaleX),
                            height: Math.max(node.height() * scaleY),
                        };
                    }

                }

                newPlots[index] = {
                    ...newPlot,
                }

            }
        });

        setPlots(newPlots);
        saveHistory(newPlots);
    };

    const saveGarden = useCallback((plots) => {
        const newGarden = { ...garden, plots };

        // Find newly added plants
        const addedPlantIds = plots.map(p => p.plant).filter(Boolean);
        const uniqueIds = [...new Set(addedPlantIds)];

        const addedPlants = uniqueIds.map(
            id => plant_options.find(opt => opt.id === id)?.name
        ).filter(Boolean);

        // Save to localStorage only if plants were added
        if (addedPlants.length > 0) {
            localStorage.setItem('recentlyAddedPlants', JSON.stringify(addedPlants));
        } else {
            localStorage.removeItem('recentlyAddedPlants');
        }

        localStorage.setItem('savedGarden', JSON.stringify(newGarden));
    }, [garden]);

    const saveHistory = useCallback((newPlots) => {
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(JSON.stringify(newPlots));
        saveGarden(newPlots);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    }, [history, historyStep, saveGarden])

    const handlePlotDragStart = (e) => {
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
                const newPlots = plots.map((plot) => {
                    if (plot.id === shape.id()) {
                        const updates = {
                            plant: plantRef.current,
                            fill: plant.color,
                        }
                        return {
                            ...plot,
                            ...updates,
                        };
                    }
                    return plot;
                });
                plantRef.current = null;

                setPlots(newPlots);
                saveHistory(newPlots);
            }
        }
    }

    const handleDelete = useCallback((e) => {
        const newPlots = plots.filter((plot) => !selectedIds.includes(plot.id));
        const newSelectedIds = [];
        setSelectedIds(newSelectedIds);

        setPlots(newPlots);
        saveHistory(newPlots);
    }, [plots, saveHistory, selectedIds])

    const handleUndo = useCallback((e) => {
        if (historyStep === 0) return;
        const newStep = historyStep - 1;
        handleDeselect();
        setHistoryStep(newStep);
        saveGarden(JSON.parse(history[newStep]));
        setPlots(JSON.parse(history[newStep]));
    }, [history, historyStep, saveGarden])

    const handleRedo = useCallback((e) => {
        if (historyStep === history.length - 1) return;
        const newStep = historyStep + 1;
        handleDeselect();
        setHistoryStep(newStep);
        saveGarden(JSON.parse(history[newStep]));
        setPlots(JSON.parse(history[newStep]));
    }, [history, historyStep, saveGarden])

    const handleSave = useCallback(async () => {
        const savedGarden = JSON.parse(localStorage.getItem('savedGarden'));
        updateGarden(id, savedGarden)
            .catch((e) => {
                console.error(`Error saving garden: ${savedGarden.name}`, e);
            })
    }, [id])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'z') {
                handleUndo();
            } else if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
                handleRedo();
            } else if (e.keyCode === 46) {
                handleDelete();
            } else if (e.keyCode === 27 || e.key === 'Escape' || (e.ctrlKey && e.key === 'd')) {
                e.preventDefault();
                handleDeselect();
            } else if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo, handleDelete, handleSave]);

    const [showGrid, setShowGrid] = useState(false);

    const stageButtons = [
        {
            id: 'toolbar-grid-button',
            value: 'grid',
            type: 'radio',
            label: <Grid3x3 />,
            name: (showGrid) ? 'Hide Grid' : 'Show Grid',
            onSelect: (value) => setShowGrid(value),
        },
    ]

    const addNewPlot = (e, shape) => {

        stageRef.current.setPointersPositions(e);

        const pos = stageRef.current.getPointerPosition();

        pos.x = pos.x * (1 / stageSize.scale);
        pos.y = pos.y * (1 / stageSize.scale);

        const newPlots = plots.concat([{
            id: `plot-${Date.now()}`,
            ...shape,
            ...pos,
        }])

        setPlots(newPlots);
        saveHistory(newPlots);
    }

    const handleElementDragStart = (e) => {
    }

    const handleElementDrag = (e) => {
        // setPosition(pos);
        stageRef.current.setPointersPositions(e);
    }

    const handleElementDragEnd = (e, value) => {

        addNewPlot(e, value);
    }

    const [tool, setTool] = useState(null);

    const onChangeTool = (value) => {
        setTool((value !== tool) ? value : null)
    };

    const handleSelect = (value) => {
        selectRef.current = value;
    }

    const getSelectedElement = () => {
        if (selectedIds.length === 1) {
            const nodes = transformerRef.current.nodes();

    
            nodes.forEach(node => { 
                const id = node.id();
                const index = plots.findIndex(r => r.id === id);
    
                if (index !== -1) {
                    return plots[index];
                }
            });
        }
        return null;
    }

    // const toolbarAssignPlant = (plotId, plantId) => {
    //     const newPlots = plots.map((plot) => {
    //         if (plot.id === shape.id()) {
    //             const updates = {
    //                 plant: plantRef.current,
    //                 fill: plant.color,
    //             }
    //             return {
    //                 ...plot,
    //                 ...updates,
    //             };
    //         }
    //         return plot;
    //     });
    // }

    const exportRef = useRef(null);

    function downloadURI(uri, name) {
        var link = document.createElement('a');
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const onExport = () => {
        const uri = exportRef.current.toDataURL();
        downloadURI(uri, 'square.png')
    }


    return (
        <Stack
            className='position-relative flex-grow-1 m-0 p-0 align-items-start'
            direction="horizontal"
            style={{ backgroundColor: 'var(--edit-background-color)' }}>
            {/* <Stage
                ref={exportRef}
                width={550}
                height={550}
            >
                <Layer>
                    <Rect
                        x={25}
                        y={25}
                        stroke='black'
                        strokeWidth={1}
                        fill='white'
                        width={500}
                        height={500}
                    />
                </Layer>
            </Stage> */}
            <LeftSidebar
                tool={tool}
                onChangeTool={onChangeTool} />
            <ElementPicker
                tool={tool}
                onHide={onChangeTool}
                garden={garden}
                element={element}
                plants={plant_options}
                plots={plotOptions}
                onSelect={handleSelect}
                onDrag={handleElementDrag}
                onDragEnd={handleElementDragEnd}
                onDragStart={handleElementDragStart}
            />
            {
                garden &&
                <div className='w-100' style={{ height: 'calc(100dvh + 75px)', scrollMarginTop: '75px' }}>
                    {/* <button onClick={onExport}>Export</button> */}
                    <Container fluid className='w-100 h-100 my-2 d-flex flex-row justify-content-center align-items-center'>
                        <div className='position-relative h-100' ref={containerRef} style={{ maxWidth: '800px', width: '100%' }}>
                            <OutdoorToolbar
                                onUndo={handleUndo}
                                onRedo={handleRedo}
                                onDelete={handleDelete}
                                plotRef={plotRef}
                                plantRef={plantRef}
                                stageButtons={stageButtons}
                                elementButtons={null}
                                selectedElement={() => getSelectedElement()}
                            />
                            <div id='stage-wrapper' className='h-100' style={{ marginTop: '75px', width: '100%', maxWidth: '800px' }}>
                                <div className='white-canvas' style={{ margin: '0 auto', width: 'fit-content', height: 'fit-content' }}>
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
                                        <Layer ref={gridLayerRef}>
                                            {showGrid &&
                                                < Grid
                                                    width={stageSize.width * (1 / stageSize.scale)}
                                                    height={stageSize.height * (1 / stageSize.scale)}
                                                    cellWidth={10}
                                                    cellHeight={10}
                                                />
                                            }

                                        </Layer>
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
                                                        plotRefs={plotRefs}
                                                        style={{ cursor: 'grab' }} />
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
                                                onTransformStart={handleTransformStart}
                                                onTransformEnd={handleTransformEnd}
                                                borderStroke="green"
                                                anchorStroke="#3B6255"
                                                anchorStrokeWidth={2}
                                                anchorStyleFunc={(anchor) => {
                                                    const nodes = transformerRef.current.nodes();
                                                    const multipleSelections = selectedIds.length > 1;
                                                    const squareShapeSelected = selectedShapes.size === 1 &&
                                                        (selectedShapes.has('circle') || selectedShapes.has('regularpolygon') ||
                                                            selectedShapes.has('arc') || selectedShapes.has('ring') ||
                                                            selectedShapes.has('wedge') || selectedShapes.has('path') ||
                                                            selectedShapes.has('star'));

                                                    if (multipleSelections || squareShapeSelected) {
                                                        if (anchor.hasName('top-center') ||
                                                            anchor.hasName('bottom-center') ||
                                                            anchor.hasName('middle-left') ||
                                                            anchor.hasName('middle-right')) {
                                                            anchor.scale({ x: 0, y: 0 });
                                                        }
                                                    } else {
                                                        if (anchor.hasName('top-center') ||
                                                            anchor.hasName('bottom-center') ||
                                                            anchor.hasName('middle-left') ||
                                                            anchor.hasName('middle-right')) {
                                                            anchor.scale({ x: 1, y: 1 });
                                                        }
                                                    }
                                                }}
                                            />
                                            {selectionRectangle.visible && (
                                                <Rect
                                                    x={Math.min(selectionRectangle.x1, selectionRectangle.x2)}
                                                    y={Math.min(selectionRectangle.y1, selectionRectangle.y2)}
                                                    width={Math.abs(selectionRectangle.x2 - selectionRectangle.x1)}
                                                    height={Math.abs(selectionRectangle.y2 - selectionRectangle.y1)}
                                                    fill="#3B6255"
                                                    opacity={0.25}
                                                    ref={selectRef}
                                                />
                                            )}
                                        </Layer>
                                    </Stage>
                                </div>
                            </div>
                        </div>
                    </Container>
                </div>
            }
        </Stack >
    )
}