import React, { useState, useEffect, useRef, useCallback } from "react";

import "../style/toolbar.css";

// Bootstrap Imports
import Button from "react-bootstrap/esm/Button";
import Stack from "react-bootstrap/Stack";
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
            if (tool === 'plant') {
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
            if (tool === 'plant') {
                onPlantDragEnd(e);
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
            if (tool === 'plant') {
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
        <div className='element-picker-wrapper position-relative zindex-sticky'>
            <div
                className={`${(tool) ? 'expanded' : ''} element-picker p-0 m-0 position-relative`}
                style={{ backgroundColor: 'var(--secondaryLightGreen)', height: 'calc(100dvh - 75px)', marginBottom: '75px', scrollMarginTop: '75px' }}
            >
                <div className='element-picker-content p-2 d-flex flex-column justify-content-center align-items-center'>
                    {(tool === 'plot') &&
                        <div className='element-grid'>
                            {plots.options.map((plot) => {
                                return (
                                    <div
                                        className='element'
                                        id={plot.id}
                                        key={plot.id}
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
                                );
                            })}
                        </div>
                    }
                    {(tool === 'garden') &&
                        <GardenSettings garden={garden} />
                    }

                </div>
            </div>

            <Button
                className={`${(tool) ? 'expanded' : ''} p-0 m-0 position-absolute h-100 top-0 bottom-0`}
                variant='collapse'
                onClick={(e) => onHide(null)}
                style={{ zIndex: 1000 }}>
                <div>
                    <TbChevronCompactLeft stroke="white" size={24} />
                </div>
            </Button>
        </div>
    );
}