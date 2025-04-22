// Uses tutorials from https://konvajs.org/docs/.
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Stage, Layer, Rect } from 'react-konva';
import { useParams } from "react-router-dom";
import { retrieveGarden, updateGarden } from '../utilities/FirebaseUtils';
import { plotOptions, pathOptions, objectOptions, textOptions } from '../utilities/Elements';
import Container from 'react-bootstrap/Container'
import Stack from 'react-bootstrap/Stack'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Plot from '../components/Elements/Plot'
import Object from '../components/Elements/Object'
import OutdoorToolbar from "../components/OutdoorToolbar";
import Grid from '../components/Grid'

import '../style/outdooredit.css';
import LeftSidebar from "../components/LeftSidebar";
import ElementPicker from '../components/ElementPicker';
import PlantInfo from '../components/PlantInfo'

import { Grid3x3 } from "react-bootstrap-icons";
import { PiHandGrabbingDuotone } from "react-icons/pi";

import 'bootstrap/dist/css/bootstrap.css';
import CustomTransformer from "../components/Elements/CustomTransformer";
import AddLayer from "../components/Elements/AddLayer";

const Konva = window.Konva;

const getRandomFillRotation = () => {
    const min = 0;
    const max = 360;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getRandomFillScaleX = () => {
    const min = 0.05;
    const max = 0.5;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getRandomFillScaleY = () => {
    const min = 0.05;
    const max = 0.5;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function OutdoorEditPage() {
    // Page data
    const { id } = useParams(); // Garden ID
    const [garden, setGarden] = useState(null); // Garden data from Firestore

    // Konva data
    const [elements, setElements] = useState(null);
    // const [plots, setPlots] = useState(null); // Plots to draw on stage
    const [plants, setPlants] = useState(null); // Garden plants
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
    const [sliderValue, setSliderValue] = useState(25);
    // Toolbar data
    const cellWidth = 10;
    const [showGrid, setShowGrid] = useState(false); // Toggles showing background grid
    const [position, setPosition] = useState(null) // Stage pointer position
    const [overCanvas, setOverCanvas] = useState(false);
    const [grabbing, setGrabbing] = useState(false);

    // Konva references
    const stageRef = useRef(null); // Konva Stage reference (resize, pointer info, etc.)
    const containerRef = useRef(null); // Konva Stage parent container reference (resize, dragover)
    const gridLayerRef = useRef(null); // Konva layer reference for background grid
    const mainLayerRef = useRef(null); // Konva layer reference for plots and other elements
    const selectRef = useRef(null); // Konva selection box reference (for selecting elements)
    const transformerRef = useRef(); // Konva reference for transformer (resize, rotate, etc.)
    const elementRefs = useRef(new Map()); // Konva references to Element shape nodes
    const addLayerRef = useRef(null);

    // References
    const elementRef = useRef(null);
    const plotRef = useRef(null); // Currently selected plot to add to canvas
    const plantRef = useRef(null); // Currently selected plant to add to plots
    const [selectedShapes, setSelectedShapes] = useState(new Set([])); // Currently selected shapes for transformation anchor settings
    const [clipboard, setClipboard] = useState([]); // Copy and paste clipboard
    const [tool, setTool] = useState(null); // Current tool (opens element picker sidebar)
    const [selectedPlant, setSelectedPlant] = useState(null);
    const [selected, setSelected] = useState(null);

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
                    const elements = {
                        plots: data.plots,
                        paths: data.paths,
                        objects: data.objects,
                        text: data.text,
                    }
                    setElements(elements);
                    // setPlots(data.plots);
                    setPlants(data.plants);
                    setHistory([JSON.stringify(elements)]);
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

    // const handleAssign = (plant_id) => {
    //     const nodes = transformerRef.current.nodes();
    //     const newPlots = [...plots];

    //     if (nodes.length > 0) {
    //         nodes.forEach(node => {
    //             const id = node.id();
    //             const index = newPlots.findIndex(plot => plot.id === id);

    //             if (index !== -1) {
    //                 newPlots[index] = {
    //                     ...newPlots[index],
    //                     plant: plant_id,
    //                 };
    //             }
    //         })
    //     }

    //     setPlots(newPlots);
    //     saveHistory(newPlots);
    // }

    // Called when deselect events
    const handleDeselect = () => {
        // Set selectedShapes set to empty
        const newShapes = new Set([]);
        setSelectedShapes(newShapes);
        // Set selected plot ids to empty
        const newIds = [];
        setSelectedIds(newIds);
        // Set selected element/tool to null
        setSelected(null);
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
        if (!e.target.hasName('plot') && !e.target.hasName('path') && !e.target.hasName('object') && !e.target.hasName('text')) {
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

    /**
     * Helper function to return element from elements based on id
     * @param {string} id 
     * @returns element - plot, path, object or text
     */
    const getElementIndex = (id, elems) => {
        return elems.findIndex(r => r.id === id);
    }

    /**
     * Helper function to return element from elements based on id
     * @param {string} id 
     * @returns element - plot, path, object or text
     */
    const getElement = (id) => {
        var index = elements.plots.findIndex(r => r.id === id);
        if (index !== -1) {
            return elements.plots[index];
        }
        index = elements.paths.findIndex(r => r.id === id);
        if (index !== -1) {
            return elements.paths[index];
        }
        index = elements.objects.findIndex(r => r.id === id);
        if (index !== -1) {
            return elements.objects[index];
        }
        index = elements.text.findIndex(r => r.id === id);
        if (index !== -1) {
            return elements.text[index];
        }
        return null;
    }

    const handleDragStart = (e) => {  
    }

    const handleDrag = (e) => {
    }

    // Handle dragging selected elements, set new plots and save to history
    const handleDragEnd = (e) => {
        var nodes = transformerRef.current.nodes();

        const newElements = {
            ...elements
        };

        if (e.target) {
            nodes.push(e.target);
        }

        if (nodes.length > 0) {
            nodes.forEach(node => {
                const id = node.id();
                const name = node.name();

                const newPos = {
                    x: node.x(),
                    y: node.y(),
                }

                if (name === 'plot') {
                    const index = getElementIndex(id, [...elements.plots]);
                    if (index !== -1) {
                        const newElement = {
                            ...elements.plots[index],
                            ...newPos,
                        }
                        newElements.plots[index] = {
                            ...newElement
                        };
                        newElements.plots[index] = {
                            ...newElement
                        }
                    }
                } else if (name === 'path') {
                    const index = getElementIndex(id, [...elements.paths]);
                    if (index !== -1) {
                        const newElement = {
                            ...elements.paths[index],
                            ...newPos,
                        }
                        newElements.paths[index] = {
                            ...newElement
                        };
                        newElements.paths[index] = {
                            ...newElement
                        }
                    }
                } else if (name === 'object') {
                    const index = getElementIndex(id, [...elements.objects]);
                    if (index !== -1) {
                        const newElement = {
                            ...elements.objects[index],
                            ...newPos,
                        }
                        newElements.objects[index] = {
                            ...newElement
                        };
                        newElements.objects[index] = {
                            ...newElement
                        }
                    }
                } else if (name === 'text') {
                    const index = getElementIndex(id, [...elements.text]);
                    if (index !== -1) {
                        const newElement = {
                            ...elements.text[index],
                            ...newPos,
                        }
                        newElements.text[index] = {
                            ...newElement
                        };
                        newElements.text[index] = {
                            ...newElement
                        }
                    }
                }
            })
        }

        setElements(newElements);
        saveHistory(newElements);
    }

    // Set transformerRef nodes after selectedIds set
    useEffect(() => {
        if (selectedIds.length && transformerRef.current) {
            const nodes = selectedIds
                .map(id => {
                    return elementRefs.current.get(id)
                })
                .filter(node => node);

            transformerRef.current.nodes(nodes);
        } else if (transformerRef.current) {
            transformerRef.current.nodes([]);
        }
    }, [selectedIds]);

    const saveSettings = (newGarden) => {
        localStorage.setItem('savedGarden', JSON.stringify(newGarden));
        setGarden(newGarden);
        updateGarden(id, newGarden)
            .catch((e) => {
                console.error(`Error saving garden settings: ${newGarden.name}`, e);
            })
    }

    /**
     * Save garden to local on every change.
     * Used by Save button in Header component to update garden in Firestore.
     */
    const saveGarden = useCallback((elements) => {
        const newGarden = { ...garden, ...elements, plants: plants };

        localStorage.setItem('savedGarden', JSON.stringify(newGarden));
    }, [garden, plants]);

    const savePlants = useCallback((plants) => {
        const newGarden = { ...garden, ...elements, plants };
        localStorage.setItem('savedGarden', JSON.stringify(newGarden));
    }, [garden, elements]);

    // Save history for undo/redo. Local save on every edit.
    const saveHistory = useCallback((newElements) => {
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(JSON.stringify({ ...newElements }));
        saveGarden(newElements);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    }, [history, historyStep, saveGarden])

    // Handles deleting elements on delete events
    const handleDelete = useCallback((e) => {
        const newElements = {
            plots: elements.plots.filter((elem) => !selectedIds.includes(elem.id)),
            paths: elements.paths.filter((elem) => !selectedIds.includes(elem.id)),
            objects: elements.objects.filter((elem) => !selectedIds.includes(elem.id)),
            text: elements.text.filter((elem) => !selectedIds.includes(elem.id)),
        };

        const newSelectedIds = [];
        setSelectedIds(newSelectedIds);

        setElements(newElements);
        saveHistory(newElements);
    }, [elements, saveHistory, selectedIds])

    // Handles undoing garden changes on undo events
    const handleUndo = useCallback((e) => {
        if (historyStep === 0) return;

        handleDeselect();
        setHistoryStep(prevStep => {
            const newStep = prevStep - 1;
            saveGarden(JSON.parse(history[newStep]));
            setElements(JSON.parse(history[newStep]));
            return newStep;
        });

    }, [history, historyStep, saveGarden])

    // Handles redoing garden changes on redo events
    const handleRedo = useCallback((e) => {
        if (historyStep === history.length - 1) return;
        handleDeselect();
        setHistoryStep(prevStep => {
            const newStep = prevStep + 1;
            saveGarden(JSON.parse(history[newStep]));
            setElements(JSON.parse(history[newStep]));
            return newStep;
        });
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
        const newClipboard = {
            plots: elements.plots.filter((elem) => selectedIds.includes(elem.id)),
            paths: elements.paths.filter((elem) => selectedIds.includes(elem.id)),
            objects: elements.objects.filter((elem) => selectedIds.includes(elem.id)),
            text: elements.text.filter((elem) => selectedIds.includes(elem.id)),
        }

        // Wait for clipboard to set to prevent premature handlePaste calls
        await setClipboard(newClipboard);
    }, [elements, selectedIds])

    // Helper function for handlePaste()
    const pasteElements = (type ,elems) => {

        // x,y offset of new elements
        const offset = 10;

        const pasteElems = elems.map((elem, index) => {
            return {
                ...elem,
                id: `${type}-${Date.now() + (index * 5)}`,
                x: elem.x + offset,
                y: elem.y + offset,
            }
        });

        return pasteElems;
    }

    // Handles pasting elements on paste events
    const handlePaste = useCallback((e) => {

        if (clipboard) {

            // Use helper to instantiate new elements
            const pastePlots = pasteElements('plot', clipboard.plots);
            const pastePaths = pasteElements('path', clipboard.paths);
            const pasteObjects = pasteElements('object', clipboard.objects);
            const pasteText = pasteElements('text', clipboard.text);

            // Add new elements to elements
            const newElements = {
                plots: elements.plots.concat(pastePlots),
                paths: elements.paths.concat(pastePaths),
                objects: elements.objects.concat(pasteObjects),
                text: elements.text.concat(pasteText),
            };

            setElements(newElements);
            saveHistory(newElements);
        }
    }, [clipboard, elements, saveHistory])

    const [checked, setChecked] = useState([false, false]);

    const handleToggle = (index) => {
        const newChecked = [...checked];
        newChecked[index] = newChecked[index] ? false : true;
        setShowGrid(newChecked[0]);
        setGrabbing(newChecked[1]);
        setChecked([...newChecked]);
    }

    // Triggers on keydown events
    useEffect(() => {

        // To call on keydown event
        const handleKeyDown = (e) => {
            const metaPressed = e.ctrlKey || e.metaKey;

            if (metaPressed && e.key === 'z') {
                handleUndo(); // Undo on 'Ctrl' + 'z'
            } else if (metaPressed && e.shiftKey && e.key === 'Z') {
                handleRedo(); // Redo on 'Ctr' + 'Shift' + 'Z'
            } else if (e.keyCode === 46) {
                handleDelete(); // Delete on 'del' key
            } else if (e.keyCode === 27 || e.key === 'Escape' || (metaPressed && e.key === 'd')) {
                e.preventDefault();
                handleDeselect(); // Deselect on 'esc' key or 'Ctrl' + 'd'
            } else if (metaPressed && e.key === 's') {
                e.preventDefault();
                handleSave(); // Save to Firestore on 'Ctrl' + 's'
            } else if (metaPressed && e.key === 'c') {
                e.preventDefault();
                handleCopy(); // Save elements to clipboard on 'Ctrl' + 'c'
            } else if (metaPressed && e.key === 'v') {
                e.preventDefault();
                handlePaste(); // Paste elements to clipboard on 'Ctrl' + 'v'
            } else if (e.code === "Space" || e.key === " " || e.keyCode === 32) {
                e.preventDefault();
                handleToggle(1);
            }
        };

        // Add keydown listener
        document.addEventListener('keydown', handleKeyDown);

        // Clean up logic
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo, handleDelete, handleSave, handleCopy, handlePaste, grabbing]);

    // View buttons on toolbar
    const stageButtons = [
        {
            id: 'toolbar-grid-button',
            value: 'grid',
            type: 'radio',
            label: <Grid3x3 />,
            name: (showGrid) ? 'Hide Grid' : 'Show Grid',
            onSelect: (value) => handleToggle(0),
        },
        {
            id: 'toolbar-grab-button',
            value: 'grab',
            type: 'radio',
            label: <PiHandGrabbingDuotone />,
            name: 'Grab',     
            onSelect: (value) => handleToggle(1),
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

            if (previousShape.current && shape) {
                if (previousShape.current !== shape) {
                    // prevPlantColor.current = shape.fill()
                    previousShape.current.fill(null);
                    if (shape.name() === 'plot') {
                        shape.fill('#cbe9d8');
                        shape.setAttrs({ fillOpacity: 0.25 });
                        previousShape.current = shape;
                    } else {
                        previousShape.current = null;
                    }
                }
            } else if (!previousShape.current && shape && shape.name() === 'plot') {
                shape.fill('#cbe9d8');
                shape.setAttrs({ fillOpacity: 0.25 });
                previousShape.current = shape;
            } else if (previousShape.current && !shape) {
                previousShape.current.fill(null);
                previousShape.current = null;
            }
        }

    }

    // If plant dragged onto plot, add plant to plot
    const handlePlantDragEnd = (e, plantId) => {
        stageRef.current.setPointersPositions(e);
        const pos = stageRef.current.getPointerPosition();
        if (pos) {
            const shape = stageRef.current.getIntersection(pos);
            // const plant = plantOptions.find((p) => p.id === plantId);
            if (shape && shape.name() === 'plot') {
                previousShape.current = null;
                prevPlantColor.current = null
                const newPlots = elements.plots.map((plot) => {
                    if (plot.id === shape.id()) {
                        return {
                            ...plot,
                            plant: plantId,
                        };
                    }
                    return plot;
                });
                plantRef.current = null;

                shape.fill(null);

                const newElements = {
                    ...elements,
                    plots: newPlots,
                }

                setElements(newElements);
                saveHistory(newElements);
            }
        }
    }

    // Handles adding new plots
    const addNewPlot = (e, shape) => {

        if (overCanvas) {
            stageRef.current.setPointersPositions(e);

            const pos = stageRef.current.getPointerPosition();

            pos.x = pos.x * (1 / stageSize.scale);
            pos.y = pos.y * (1 / stageSize.scale);

            const newPlots = elements.plots.concat([{
                id: `plot-${Date.now()}`,
                ...shape,
                ...pos,
                scaleX: 1,
                scaleY: 1,
                randomFillRotation: getRandomFillRotation(),
                randomFillScaleX: getRandomFillScaleX(),
                randomFillScaleY: getRandomFillScaleY(),
            }])

            const newElements = {
                ...elements,
                plots: newPlots,
            }

            setElements(newElements);
            saveHistory(newElements);
        }

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

    const handleAddElement = (type, elem) => {
        if (elem) {
            var newElements = {
                ...elements,
            };

            switch (type) {
                case 'path': newElements = {
                    ...newElements,
                    paths: newElements.paths.concat(elem),
                }; break;
                case 'text': newElements = {
                    ...newElements,
                    text: newElements.text.concat(elem),
                }; break;
                case 'object':
                default: newElements = {
                    ...newElements,
                    objects: newElements.objects.concat(elem),
                }
            }

            setElements(newElements);
            saveHistory(newElements);
        }
    }

    useEffect(() => {
        if (tool === null) {
            setSelected(null);
        }
    }, [tool])

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
    const handleSelect = (e, value) => {
        setSelected(value);
    }

    // Get shape of currently selected element to set transform settings
    const getSelectedElement = () => {
        if (selectedIds.length === 1) {
            const nodes = transformerRef.current.nodes();

            nodes.forEach(node => {
                const id = node.id();
                return getElement(id);
            });
        }
        return null;
    }

    // For displaying coordinates using actual garden dimensions
    const handleMouseOver = (e) => {
        const pos = stageRef.current.getPointerPosition();
        setPosition({
            x: Math.trunc(pos.x * (1 / stageSize.scale)) / 100,
            y: Math.trunc(pos.y * (1 / stageSize.scale)) / 100,
        });
    }

    // Plant being dragged for assignment to a plot
    const handleSelectPlant = (plantObj) => {
        setSelectedPlant((selectedPlant && selectedPlant.id === plantObj.id) ? null : plantObj);
    };

    // Add plant for plant search to garden plants
    const handleAddPlant = (plant) => {
        const newPlants = plants.concat([plant]);
        setPlants(newPlants);
        savePlants(newPlants);
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

    const handleSliderValueChange = (value) => {
        setSliderValue(value);
    }

    return (
        // Main edit Grid
        <Container
            fluid
            className='position-relative flex-grow-1 m-0 px-2 align-items-start '
            style={{ backgroundColor: 'var(--edit-background-color)' }}>
            <Row className='flex-nowrap'>

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
                            view="outdoor"
                            tool={tool}
                            onHide={onChangeTool}
                            garden={garden}
                            plants={plants}
                            plots={plotOptions}
                            paths={pathOptions}
                            objects={objectOptions}
                            text={textOptions}
                            onUpdateGarden={saveSettings}
                            onAddPlant={handleAddPlant}
                            selected={selected}
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
                    {(garden && elements && plants) && // Wait for garden data from Firestore
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
                                        stageButtons={stageButtons}
                                        checked={checked}
                                        elementButtons={null}
                                        selectedElement={() => getSelectedElement()}
                                        sliderValue={sliderValue}
                                        onSliderChange={handleSliderValueChange}
                                    />
                                    <div
                                        id='stage-wrapper'
                                        className='h-100'
                                        style={{ marginTop: '75px', width: '100%' }}>
                                        {/* Adds white background to stage canvas */}
                                        <div
                                            className='background-canvas'
                                            onMouseLeave={(e) => {
                                                setOverCanvas(false);
                                                setPosition(null);
                                            }}
                                            onDragLeave={() => {
                                                setOverCanvas(false);
                                                setPosition(null);
                                            }}
                                            onMouseMove={(e) => handleMouseOver(e)}
                                            onMouseOver={
                                                (e) => {
                                                    setOverCanvas(true)
                                                }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                handleMouseOver(e);
                                                setOverCanvas(true);
                                            }}
                                            style={{
                                                backgroundColor: `${garden.background ? garden.background : 'white'}`,
                                                margin: '0 auto',
                                                width: 'fit-content',
                                                height: 'fit-content'
                                            }}>
                                            {/* Konva stage canvas */}
                                            <Stage
                                                width={stageSize.width ? stageSize.width : 1}
                                                height={stageSize.height ? stageSize.height : 1}
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
                                                            cellWidth={cellWidth}
                                                            cellHeight={cellWidth}
                                                        />
                                                    }

                                                </Layer>
                                                <AddLayer
                                                    stageRef={stageRef}
                                                    ref={addLayerRef}
                                                    selected={selected}
                                                    overCanvas={overCanvas}
                                                    onAddElement={handleAddElement}
                                                    onAddEnd={() => setSelected(null)}
                                                    scale={stageSize.scale}
                                                    sliderValue={sliderValue} />
                                                {/* Layer for elements */}
                                                <Layer ref={mainLayerRef}>
                                                    {elements.plots.map((plot) => {
                                                        const { id, shape, x, y, rotation, plant, draggable, scaleX, scaleY, ...restProps } = plot;
                                                        return (
                                                            <Plot
                                                                key={id}
                                                                id={id}
                                                                shape={shape}
                                                                x={x}
                                                                y={y}
                                                                rotation={rotation}
                                                                shapeProps={restProps}
                                                                plant={plant}
                                                                plants={plants}
                                                                scaleX={scaleX}
                                                                scaleY={scaleY}
                                                                // onDrag={handleDrag}
                                                                onDragEnd={handleDragEnd}
                                                                // onDragStart={handleDragStart}
                                                                // onTransformEnd={handleTransformEnd}
                                                                elementRefs={elementRefs}
                                                                draggable={draggable && grabbing} />
                                                        )
                                                    })}
                                                    {elements.objects.map((object) => {
                                                        const { id, shape, x, y, rotation, draggable, scaleX, scaleY, ...restProps } = object;
                                                        return (
                                                            <Object
                                                                key={id}
                                                                id={id}
                                                                shape={shape}
                                                                x={x}
                                                                y={y}
                                                                rotation={rotation}
                                                                scaleX={scaleX}
                                                                scaleY={scaleY}
                                                                shapeProps={restProps}
                                                                // onDrag={handleDrag}
                                                                onDragEnd={handleDragEnd}
                                                                // onDragStart={handleDragStart}
                                                                // onTransformEnd={handleTransformEnd}
                                                                elementRefs={elementRefs}
                                                                draggable={draggable && grabbing} />
                                                        )
                                                    })}
                                                    {/* Transformer (anchor points) */}
                                                    <CustomTransformer
                                                        ref={transformerRef}
                                                        elements={elements}
                                                        setElements={setElements}
                                                        saveHistory={saveHistory}
                                                        selectedShapes={selectedShapes}
                                                        selectedIds={selectedIds}
                                                        grabbing={grabbing}
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
                        plants={plants}
                        plant={selectedPlant}
                        onSelect={handleSelectPlant} />
                </Col>
            </Row>
        </Container >
    )
}