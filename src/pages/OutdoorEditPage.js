// Uses tutorials from https://konvajs.org/docs/.
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import { useParams } from "react-router-dom";
import { retrieveGarden, updateGarden } from '../utilities/FirebaseUtils';
import { plotOptions, plantOptions } from '../utilities/Elements';
import Container from 'react-bootstrap/Container'
import Stack from 'react-bootstrap/Stack'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

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
import PlantInfo from '../components/PlantInfo'

import { Grid3x3 } from "react-bootstrap-icons";

import {
    Shape, Circle, Arc, Ellipse, Line, Path, RegularPolygon, Ring, Star, Wedge, Image
} from 'react-konva';

import 'bootstrap/dist/css/bootstrap.css';

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
    // Page data
    const { id } = useParams(); // Garden ID
    const [garden, setGarden] = useState(null); // Garden data from Firestore
    const species = plant_options;

    // Konva data
    const [plots, setPlots] = useState(null); // Plots to draw on stage
    const [history, setHistory] = useState([JSON.stringify(null)]); // History for undo/redo
    const [historyStep, setHistoryStep] = useState(0); // Current step in history
    const [selectedIds, setSelectedIds] = useState([]); // IDs of plots currently selected
    const [selectionRectangle, setSelectionRectangle] = useState({
        visible: false,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0
    }) // Data for selection box
    const isSelecting = useRef(false); // Currently selecting
    const [scene, setScene] = useState({}); // The initial size of the stage
    const [stageSize, setStageSize] = useState({
        width: 0,
        height: 0,
        scale: 1
    }); // The current size of the stage
    // Toolbar data
    const [showGrid, setShowGrid] = useState(false); // Toggles showing background grid
    const [position, setPosition] = useState({
        x: 0,
        y: 0,
    }) // Stage pointer position

    // Konva references
    const stageRef = useRef(null); // Konva Stage reference (resize, pointer info, etc.)
    const containerRef = useRef(null); // Konva Stage parent container reference (resize, dragover)
    const gridLayerRef = useRef(null); // Konva layer reference for background grid
    const mainLayerRef = useRef(null); // Konva layer reference for plots and other elements
    const selectRef = useRef(null); // Konva selection box reference (for selecting elements)
    const transformerRef = useRef(); // Konva reference for transformer (resize, rotate, etc.)
    const plotRefs = useRef(new Map()); // Konva references to Plot shape nodes

    // References
    const plotRef = useRef(null); // Currently selected plot to add to canvas
    const plantRef = useRef(null); // Currently selected plant to add to plots
    const [selectedShapes, setSelectedShapes] = useState(new Set([])); // Currently selected shapes for transformation anchor settings
    const [clipboard, setClipboard] = useState([]); // Copy and paste clipboard
    const [tool, setTool] = useState(null); // Current tool (opens element picker sidebar)
    const [selectedPlant, setSelectedPlant] = useState(null);

    // Set initial stage size after garden data loaded to scene
    useEffect(() => {
        setStageSize({
            ...scene,
            scale: 1
        })
    }, [scene])

    // Fetch garden data from Firestore
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

    // Use to resize stage
    const updateSize = useCallback(() => {
        if (!stageRef.current) return;

        if (scene && scene.width) {

            // Get width and scale of containerRef
            const containerWidth = containerRef.current.offsetWidth;
            const scale = containerWidth / scene.width;

            // Update stage with new dimensions
            setStageSize({
                width: scene.width * scale,
                height: scene.height * scale,
                scale: scale
            });
        }

    }, [scene]);

    // Update stage size on window resize
    // useEffect(() => {
    //     updateSize();
    //     window.addEventListener('resize', updateSize);

    //     return () => {
    //         window.removeEventListener('resize', updateSize);
    //     };
    // }, [updateSize]);

    // Update stage size on parent container (containerRef) resize
    useEffect(() => {

        // Initial resize on page load
        updateSize();

        // Create and add resize observer to containerRef
        const resizeObserver = new ResizeObserver(entries => {
            updateSize();
        });
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // Clean-up logic
        return () => {
            if (containerRef.current) {
                resizeObserver.unobserve(containerRef.current);
            }
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

    // Called when deselect events
    const handleDeselect = () => {
        // Set selectedShapes set to empty
        const newShapes = new Set([]);
        setSelectedShapes(newShapes);
        // Set selected plot ids to empty
        const newIds = [];
        setSelectedIds(newIds);
    }

    // Handles stage click selection events
    const handleStageClick = (e) => {
        // Return if selection rectangle already initialized
        if (selectionRectangle.visible) {
            return;
        }

        // Deselect on stage click
        if (e.target === e.target.getStage()) {
            handleDeselect();
            return;
        }

        // Do nothing if currently selected plot 
        if (!e.target.hasName('plot')) {
            return;
        }

        // Id of clicked on element
        const clickedId = e.target.id();

        // Different behavior on key pressed
        const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        const isSelected = selectedIds.includes(clickedId);

        // Concat element on meta press select if not already selected, remove if already selected
        if (!metaPressed && !isSelected) {
            const newShapes = new Set([]);
            setSelectedIds([clickedId]);
            newShapes.add(e.target.getClassName().toLowerCase());
            setSelectedShapes(newShapes);
        } else if (metaPressed && isSelected) {
            setSelectedIds(selectedIds.filter(id => id !== clickedId));
            const newShapes = selectedShapes;
            newShapes.delete(e.target.getClassName().toLowerCase());
        } else if (metaPressed && !isSelected) {
            setSelectedIds([...selectedIds, clickedId]);
            const newShapes = selectedShapes;
            newShapes.add(e.target.getClassName().toLowerCase());
        }
    };

    // Handles selection box sizing intialization on mouse down event
    const handleMouseDown = (e) => {
        // Return clicked outside stage
        if (e.target !== e.target.getStage()) {
            return;
        }

        // Set selection box to visible, set position
        // isSelecting.current = true;
        // const pos = e.target.getStage().getPointerPosition();
        // setSelectionRectangle({
        //     visible: true,
        //     x1: pos.x * (1 / stageSize.scale),
        //     y1: pos.y * (1 / stageSize.scale),
        //     x2: pos.x * (1 / stageSize.scale),
        //     y2: pos.y * (1 / stageSize.scale),
        // });
    };

    // Handles selection box resizing on mouse move
    const handleMouseMove = (e) => {
        if (!isSelecting.current) {
            return;
        }

        // const pos = e.target.getStage().getPointerPosition();
        // setSelectionRectangle({
        //     ...selectionRectangle,
        //     x2: pos.x * (1 / stageSize.scale),
        //     y2: pos.y * (1 / stageSize.scale),
        // });
    };

    /**
     * Handles setting selectedIds after for elements in selection box after 
     * mouse up event
     */
    const handleMouseUp = () => {
        // if (!isSelecting.current) {
        //     return;
        // }
        // isSelecting.current = false;

        // setTimeout(() => {
        //     setSelectionRectangle({
        //         ...selectionRectangle,
        //         visible: false,
        //     });
        // });

        // const selBox = {
        //     x: Math.min(selectionRectangle.x1, selectionRectangle.x2),
        //     y: Math.min(selectionRectangle.y1, selectionRectangle.y2),
        //     width: Math.abs(selectionRectangle.x2 - selectionRectangle.x1),
        //     height: Math.abs(selectionRectangle.y2 - selectionRectangle.y1),
        // };

        // const nodes = plots
        //     .map(({ id }) => plotRefs.current.get(id))
        //     .filter(node => node);

        // const selected = nodes.filter((node, index) => {

        //     return Konva.Util.haveIntersection(selBox, {
        //         x: node.x(),
        //         y: node.y(),
        //         width: node.width(),
        //         height: node.height(),
        //     });
        // });

        // setSelectedIds(selected.map(plot => plot.id()));
    };

    // Handle dragging selected elements, set new plots and save to history
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

    // Set transformerRef nodes after selectedIds set
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

    // Handle element resizing and rotation, set new plots and save to history
    const handleTransformEnd = (e) => {
        // Get nodes of selected elements
        const nodes = transformerRef.current.nodes();

        const newPlots = [...plots];

        // Set new transformed data to elements, necessary as transformation
        // set scale, which changes stroke width (not what we want)
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

                    // Different element data dependent on underlying element shape
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

    /**
     * Save garden to local on every change.
     * Used by Save button in Header component to update garden in Firestore.
     */
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

    // Save history for undo/redo. Local save on every edit.
    const saveHistory = useCallback((newPlots) => {
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(JSON.stringify(newPlots));
        saveGarden(newPlots);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    }, [history, historyStep, saveGarden])

    // Handles deleting elements on delete events
    const handleDelete = useCallback((e) => {
        const newPlots = plots.filter((plot) => !selectedIds.includes(plot.id));
        const newSelectedIds = [];
        setSelectedIds(newSelectedIds);

        setPlots(newPlots);
        saveHistory(newPlots);
    }, [plots, saveHistory, selectedIds])

    // Handles undoing garden changes on undo events
    const handleUndo = useCallback((e) => {
        if (historyStep === 0) return;
        const newStep = historyStep - 1;
        handleDeselect();
        setHistoryStep(newStep);
        saveGarden(JSON.parse(history[newStep]));
        setPlots(JSON.parse(history[newStep]));
    }, [history, historyStep, saveGarden])

    // Handles redoing garden changes on redo events
    const handleRedo = useCallback((e) => {
        if (historyStep === history.length - 1) return;
        const newStep = historyStep + 1;
        handleDeselect();
        setHistoryStep(newStep);
        saveGarden(JSON.parse(history[newStep]));
        setPlots(JSON.parse(history[newStep]));
    }, [history, historyStep, saveGarden])

    // Updates garden directly to Firestore on 'Ctrl' + 's' key event
    const handleSave = useCallback(async () => {
        const savedGarden = JSON.parse(localStorage.getItem('savedGarden'));
        updateGarden(id, savedGarden)
            .catch((e) => {
                console.error(`Error saving garden: ${savedGarden.name}`, e);
            })
    }, [id])

    // Handles copying elements on copy events
    const handleCopy = useCallback(async () => {
        // Add elements of selectedIds to clipboard
        const newClipboard = selectedIds.map((plotId) => {
            const copiedPlot = plots.find((plot) => plot.id === plotId);
            if (!copiedPlot) {
                console.error('Error: Could not find plot with id: ' + plotId);
            }
            return copiedPlot;
        })

        // Wait for clipboard to set to prevent premature handlePaste calls
        await setClipboard(newClipboard);
    }, [plots, selectedIds])

    // Handles pasting elements on paste events
    const handlePaste = useCallback((e) => {

        if (clipboard) {

            // x,y offset of new elements
            const offset = 10;

            const pastePlots = clipboard.map((plot, index) => {
                return {
                    ...plot,
                    id: `plot-${Date.now() + (index * 5)}`,
                    x: plot.x + offset,
                    y: plot.y + offset,
                }
            });

            // Add new plots to plots
            const newPlots = plots.concat(pastePlots);

            setPlots(newPlots);
            saveHistory(newPlots);
        }
    }, [clipboard, plots, saveHistory])

    // Triggers on keydown events
    useEffect(() => {

        // To call on keydown event
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'z') {
                handleUndo(); // Undo on 'Ctrl' + 'z'
            } else if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
                handleRedo(); // Redo on 'Ctr' + 'Shift' + 'Z'
            } else if (e.keyCode === 46) {
                handleDelete(); // Delete on 'del' key
            } else if (e.keyCode === 27 || e.key === 'Escape' || (e.ctrlKey && e.key === 'd')) {
                e.preventDefault();
                handleDeselect(); // Deselect on 'esc' key or 'Ctrl' + 'd'
            } else if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                handleSave(); // Save to Firestore on 'Ctrl' + 's'
            } else if (e.ctrlKey && e.key === 'c') {
                e.preventDefault();
                handleCopy(); // Save elements to clipboard on 'Ctrl' + 'c'
            } else if (e.ctrlKey && e.key === 'v') {
                e.preventDefault();
                handlePaste(); // Paste elements to clipboard on 'Ctrl' + 'v'
            }
        };

        // Add keydown listener
        document.addEventListener('keydown', handleKeyDown);

        // Clean up logic
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo, handleDelete, handleSave, handleCopy, handlePaste]);

    // View buttons on toolbar
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

    const handlePlantDragStart = (e) => {
    }

    const previousShape = useRef(null);
    const prevPlantColor = useRef(null);
    const handlePlantDrag = (e) => {
        stageRef.current.setPointersPositions(e);
        const pos = stageRef.current.getPointerPosition();
        if (pos) {
            const shape = stageRef.current.getIntersection(pos);
            // const plant = plant_options.find((p) => p.id === plantRef.current);

            if (previousShape.current && shape) {
                if (previousShape.current !== shape) {
                    // prevPlantColor.current = shape.fill()
                    shape.fill('#cbe9d8');
                    shape.setAttrs({ fillOpacity: 0.25 });
                    previousShape.current = shape;
                }
            } else if (!previousShape.current && shape) {
                // prevPlantColor.current = shape.fill()
                shape.fill('#cbe9d8');
                shape.setAttrs({ fillOpacity: 0.25 });
                previousShape.current = shape;
            } else if (previousShape.current && !shape) {
                previousShape.current.fill('white');
                previousShape.current = null;
            }
        }

    }

    const handlePlantDragEnd = (e, plantId) => {
        stageRef.current.setPointersPositions(e);
        const pos = stageRef.current.getPointerPosition();
        if (pos) {
            const shape = stageRef.current.getIntersection(pos);
            // const plant = plantOptions.find((p) => p.id === plantId);
            if (shape) {
                previousShape.current = null;
                prevPlantColor.current = null
                const newPlots = plots.map((plot) => {
                    if (plot.id === shape.id()) {
                        return {
                            ...plot,
                            plant: plantId,
                        };
                    }
                    return plot;
                });
                plantRef.current = null;

                shape.fill('white');

                setPlots(newPlots);
                saveHistory(newPlots);
            }
        }
    }

    // Handles adding new plots
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

    // Handles element drag start event
    const handleElementDragStart = (e) => {
    }

    // Handles element drag event
    const handleElementDrag = (e) => {
        // setPosition(pos);
        stageRef.current.setPointersPositions(e);
    }

    // Handles adding new plot on element drag end event
    const handleElementDragEnd = (e, value) => {
        addNewPlot(e, value);
    }

    // 
    /**
     * Sets tool based on LeftSideBar button presses.
     * Expands element picker and determines drag behavior.
     * @param {string} value - tool type (plot, plant, etc.)
     */
    const onChangeTool = (value) => {
        if (value === null) {
            setTool(null);
        } else {
            setTool((value !== tool) ? value : null)
        }
    };

    /**
     * Set reference to currently selected element.
     * @param {string} value - specific element
     */
    const handleSelect = (value) => {
        selectRef.current = value;
    }

    // Get shape of currently selected element to set transform settings
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

    const handleMouseOver = (e) => {
        const pos = stageRef.current.getPointerPosition();
        setPosition({
            x: Math.trunc(pos.x * (1 / stageSize.scale)) / 100,
            y: Math.trunc(pos.y * (1 / stageSize.scale)) / 100,
        });
    }

    // useEffect(() => {
    //     const pos = stageRef.current.getPointerPosition();
    // }, []);

    const handleSelectPlant = (plantId) => {
        console.log(plantId + " " + selectedPlant);
        setSelectedPlant((plantId === selectedPlant) ? null : plantId);
    }

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
        // Main edit Grid
        <Container
            fluid
            className='position-relative flex-grow-1 m-0 px-2 align-items-start '
            style={{ backgroundColor: 'var(--edit-background-color)' }}>
            <Row className='flex-nowrap'>
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
                {/* Element Sidebar */}
                <Col xs='auto' className='p-0'>
                    <Stack
                        direction="horizontal"
                    >
                        {/* Left tool sidebar (Garden, Plots, Plants, Paths, Objects, Text and Help) */}
                        <LeftSidebar
                            tool={tool}
                            onChangeTool={onChangeTool} />
                        {/* Expanded portion of sidebar */}
                        <ElementPicker
                            tool={tool}
                            onHide={onChangeTool}
                            garden={garden}
                            plants={plantOptions}
                            plots={plotOptions}
                            onSelect={handleSelect}
                            onDrag={handleElementDrag}
                            onDragEnd={handleElementDragEnd}
                            onDragStart={handleElementDragStart}
                            onPlantDrag={handlePlantDrag}
                            onPlantDragEnd={handlePlantDragEnd}
                            onPlantDragStart={handlePlantDragStart}
                        />
                    </Stack>
                </Col>
                {/* Stage that display garden for editing */}
                <Col className='p-0 position-relative' style={{ minWidth: '0' }}>
                    {(garden && position) &&
                        <p className='position-absolute bottom-0 left-0 ms-1'>
                            {`(${position.x} ${garden.dimensions_units}, ${position.y} ${garden.dimensions_units})`}
                        </p>}
                    {garden && // Wait for garden data from Firestore
                        // Make garden editing playground the height of visible viewport minus the header
                        <div className='p-4' style={{ height: 'calc(100svh - 75px)' }}>
                            {/* <button onClick={onExport}>Export</button> */}
                            {/* Center stage */}
                            <div className='w-100 h-100 my-2 d-flex flex-row justify-content-center align-items-center'>
                                {/* Facilitates stage canvas resizing */}
                                <div className='position-relative h-100' ref={containerRef} style={{ width: '100%' }}>
                                    {/* Toolbar with stage view settings and element settings */}
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
                                    <div
                                        id='stage-wrapper'
                                        className='h-100'
                                        style={{ marginTop: '75px', width: '100%' }}>
                                        {/* Adds white background to stage canvas */}
                                        <div
                                            className='white-canvas'
                                            onMouseLeave={(e) => setPosition(null)}
                                            onMouseMove={(e) => handleMouseOver(e)}
                                            // onMouseOver={(e) => handleMouseOver(e)}
                                            onDragOver={(e) => e.preventDefault()}
                                            style={{ margin: '0 auto', width: 'fit-content', height: 'fit-content' }}>
                                            {/* Konva stage canvas */}
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
                                                {/* Layer for grid */}
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
                                                {/* Layer for elements */}
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
                                                    {/* Transformer (anchor points) */}
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
                                                    {/* Selection box */}
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
                            </div>
                        </div>
                    }
                </Col>
                <Col xs='auto'>
                    <PlantInfo
                        garden={garden}
                        plant={selectedPlant}
                        onSelect={handleSelectPlant} />
                </Col>
            </Row>
        </Container >
    )
}