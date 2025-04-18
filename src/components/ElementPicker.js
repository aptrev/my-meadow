import React, { useState, useEffect, useRef, useCallback } from "react";
import "../style/toolbar.css";

// Bootstrap Imports
import Button from "react-bootstrap/esm/Button";
import Stack from "react-bootstrap/Stack";
import { PlusSquare } from "react-bootstrap-icons";
import { TbChevronCompactLeft } from "react-icons/tb";

import '../style/home.css';
import '../style/outdooredit.css';
import GardenSettings from "./GardenSettings";
import PlantSearch from "./PlantSearch";

export default function ElementPicker({ garden, tool, onHide, plants, onAddPlant, plots, onSelect,
    onDrag, onDragEnd, onDragStart, onPlantDrag, onPlantDragStart, onPlantDragEnd, }) {
    const [dragging, setDragging] = useState(false);
    const [showPlantSearch, setShowPlantSearch] = useState(false);

    const handleSelectPlant = (plant) => {
        onAddPlant(plant);
        setShowPlantSearch(false);
    }

    useEffect(() => {
        const handleEsc = (e) => {
          if (e.key === "Escape") {
            setShowPlantSearch(false);
          }
        };
      
        if (showPlantSearch) {
          window.addEventListener("keydown", handleEsc);
        }
      
        return () => {
          window.removeEventListener("keydown", handleEsc);
        };
      }, [showPlantSearch]);      

    function usePrevious(value) {
        const ref = useRef()
        useEffect(() => {
            ref.current = value
        })
        return ref.current
    }

    const handleMouseMove = useCallback(
        (e) => {
            console.log('test');
            if (tool === 'plants') {
                onPlantDrag(e);
            } else if (tool) {
                onDrag(e);
            }
        },
        [tool, onDrag, onPlantDrag]
    )

    const handleMouseUp = useCallback(
        (e, value) => {
            if (tool === 'plants') {
                onPlantDragEnd(e, value);
            } else if (tool) {
                onDragEnd(e, value);
            }
            document.removeEventListener('mousemove', handleMouseMove);
            onSelect(null);
            setDragging(false);
        },
        [tool, onSelect, onDragEnd, onPlantDragEnd, handleMouseMove]
    )

    const handleMouseDown = useCallback(
        (e, value) => {
            setDragging(true);
            onSelect(value);
            if (tool === 'plants') {
                onPlantDragStart(e);
            } else if (tool) {
                onDragStart(e);
            }

            document.addEventListener('mousemove', handleMouseMove)
        },
        [tool, setDragging, onSelect, onDragStart, onPlantDragStart, handleMouseMove]
    )

    const prevMouseMove = usePrevious(handleMouseMove);

    useEffect(
        () => {
            document.removeEventListener('mousemove', prevMouseMove);
            if (dragging) {
                document.addEventListener('mousemove', handleMouseMove)
            }
        },
        [prevMouseMove, handleMouseMove, dragging]
    )

    useEffect(
        () => {
            if (dragging) {
                document.addEventListener('mouseup', handleMouseUp)
            }
            return () => document.removeEventListener('mouseup', handleMouseUp)
        },
        [dragging, handleMouseUp]
    )

    return (
        <div className={`${(tool) ? 'expanded' : ''} element-picker-wrapper position-relative zindex-sticky`} style={{ width: 'auto' }}>
            <div
                className={`element-picker p-0 m-0 position-relative`}
                style={{ backgroundColor: 'var(--secondaryLightGreen)', height: 'calc(100svh - 75px)' }}
            >
                {tool &&
                    <div className='element-picker-content p-2 d-flex flex-column justify-content-center align-items-center'>
                        {(tool === 'plot') &&
                            <div className='element-grid'>
                                {plots.options.map((plot) => {
                                    return (
                                        <div
                                            className='element-container'
                                            id={'element-container-' + plot.id}
                                            key={'element-container-' + plot.id}
                                        >
                                            <div
                                                className='element'
                                            >
                                                <img
                                                    src={plot.src}
                                                    title={plot.name}
                                                    alt={plot.name}
                                                    onDrag={(e) => handleMouseMove(e)}
                                                    onDragEnd={(e) => handleMouseUp(e, plot.shape)}
                                                    onDragStart={(e) => handleMouseDown(e)}
                                                ></img>
                                                <div className='element-overlay'>
                                                    <p className='element-overlay-tip ms-1'>Click & Drag</p>
                                                </div>
                                            </div>
                                            <p className='label'>{plot.name}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        }
                        {(tool === 'garden') &&
                            <GardenSettings garden={garden} />
                        }
                        {(tool === 'plants' && plants) &&
                            <div className="plant-content" style={{ overflowY: 'auto', maxHeight: '100%' }}>
                                <div className='element-grid'>
                                    {plants.map((plant) => {
                                        return (
                                            <div
                                                className='element-container'
                                                id={'element-container-' + plant.id}
                                                key={'element-container-' + plant.id}
                                            >
                                                <div
                                                    className='element'
                                                >
                                                    <img
                                                        src={require(`../assets/images/plants/${plant.image}`)}
                                                        title={plant.name}
                                                        alt={plant.name}
                                                        onDrag={(e) => handleMouseMove(e)}
                                                        onDragEnd={(e) => handleMouseUp(e, plant.id)}
                                                        onDragStart={(e) => handleMouseDown(e)}
                                                    ></img>
                                                    <div className='element-overlay'>
                                                        <p className='element-overlay-tip ms-1'>Click & Drag</p>
                                                    </div>
                                                </div>
                                                <p className='label'>{plant.name}</p>
                                            </div>
                                        );
                                    })}
                                    <div
                                        className='element-container' 
                                        onClick={() => setShowPlantSearch(true)}
                                    >
                                        <div
                                            className='element'
                                        >
                                            <PlusSquare fill='currentColor' size={64}/>
                                        </div>
                                        <p className='label'>Add Plants</p>
                                    </div>
                                </div>
                            </div>
                        }

                    </div>
                }
            </div>

            <Button
                className={`collapse-element-picker p-0 m-0 position-absolute h-100 top-0 bottom-0`}
                variant='collapse'
                onClick={(e) => onHide(null)}
                style={{ zIndex: 1000, right: '-15px' }}>
                <div>
                    <TbChevronCompactLeft stroke="white" size={24} />
                </div>
            </Button>

            {showPlantSearch && (
                <div
                    className="plant-search-overlay"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        zIndex: 3000,
                    }}
                    onClick={() => setShowPlantSearch(false)}
                >
                    <div
                        className="plant-search-popup"
                        style={{
                            position: "fixed",
                            top: "20%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "600px",
                            maxWidth: "90vw",
                            backgroundColor: "white",
                            border: "2px solid #ccc",
                            borderRadius: "12px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                            padding: "1rem",
                            zIndex: 3001,
                            overflowY: "auto",
                            maxHeight: "70vh"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setShowPlantSearch(false)}
                            style={{
                                position: "absolute",
                                top: "6px",
                                right: "10px",
                                zIndex: 1001,
                            }}
                        >
                            ✕
                        </button>
                        <PlantSearch
                            onSearchSelect={(plant) => {
                                console.log("Selected plant:", plant);
                                handleSelectPlant(plant);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}