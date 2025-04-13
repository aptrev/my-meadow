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

export default function ElementPicker({ garden, tool, onHide, plants, plots, onSelect,
    onDrag, onDragEnd, onDragStart, onPlantDrag, onPlantDragStart, onPlantDragEnd, }) {
    const [dragging, setDragging] = useState(null);

    function usePrevious(value) {
        const ref = useRef()
        useEffect(() => {
            ref.current = value
        })
        return ref.current
    }

    const handleMouseMove = useCallback(
        (e) => {
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
            setDragging(false);
            if (tool === 'plants') {
                onPlantDragEnd(e, value);
            } else if (tool) {
                onDragEnd(e, value);
            }
            document.removeEventListener('mousemove', handleMouseMove);
            onSelect(null);
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

    const prevMouseMove = usePrevious(handleMouseMove)

    useEffect(
        () => {
            document.removeEventListener('mousemove', handleMouseMove);
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
                        {(tool === 'plants') &&
                            <div className="plant-content">
                                <div className='element-grid'>
                                    {plants.options.map((plant) => {
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
                                                        src={plant.src}
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
        </div>
    );
}