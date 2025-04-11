import React, { useState, useEffect, useRef, useCallback } from "react";

import "../style/toolbar.css";

// Bootstrap Imports
import Button from "react-bootstrap/esm/Button";
import Stack from "react-bootstrap/Stack";
import { TbChevronCompactLeft } from "react-icons/tb";

import '../style/home.css';
import '../style/outdooredit.css';

export default function ElementPicker({ tool, onHide, plants, plots, plotRef, 
    onDrag, onDragEnd, onDragStart, onPlantDrag, onPlantDragStart, onPlantDragEnd,
    onSelect }) {
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
        (e) => {
            setDragging(false);
            if (tool === 'plant') {
                onPlantDragEnd(e);
            } else if (tool) {
                onDragEnd(e);
            }
            document.removeEventListener('mousemove', handleMouseMove);
        },
        [tool, onDragEnd, onPlantDragEnd, handleMouseMove]
    )

    const handleMouseDown = useCallback(
        (e, value, index) => {
            setDragging(true);
            if (tool === 'plant') {
                onPlantDragStart(e);
            } else if (tool) {
                onDragStart(e);
            }
            document.removeEventListener('mousemove', handleMouseMove);

            document.addEventListener('mousemove', handleMouseMove)
        },
        [tool, setDragging, onDragStart, onPlantDragStart, handleMouseMove]
    )

    const prevMouseMove = usePrevious(handleMouseMove)

    useEffect(
        () => {
            document.removeEventListener('mousemove', prevMouseMove);
            if (dragging !== null) {
                document.addEventListener('mousemove', handleMouseMove)
            }
        },
        [prevMouseMove, handleMouseMove, dragging]
    )

    useEffect(
        () => {
            if (dragging !== null) {
                document.addEventListener('mouseup', handleMouseUp)
            }
            return () => document.removeEventListener('mouseup', handleMouseUp)
        },
        [dragging, handleMouseUp]
    )
    return (
        <div className='element-picker-wrapper position-relative'>
            <div
                className={`${(tool) ? 'expanded' : ''} element-picker p-0 m-0 position-relative`}
                style={{ backgroundColor: 'var(--secondaryLightGreen)', height: 'calc(100dvh - 75px)', marginBottom: '75px', scrollMarginTop: '75px' }}
            >
                <div className='element-picker-content p-2 d-flex flex-column justify-content-center align-items-center'>
                    <div className='element-grid'>
                        {(tool === 'plot') && plots.map((plot) => {
                            return (
                                <div
                                    className='element'
                                    id={plot.id}
                                    key={plot.id}
                                >
                                    <img
                                        src={plot.src}
                                        alt={plot.name}
                                        // onDrag={(e) => handleDrag(e, plot.value)}
                                        // onDragEnd={(e) => onDragEnd(e)}
                                    ></img>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Button
                className={`${(tool) ? 'expanded' : ''} p-0 m-0 position-absolute h-100 top-0 bottom-0`}
                variant='collapse'
                onClick={(e) => onHide(null)}>
                <div>
                    <TbChevronCompactLeft stroke="white" size={24} />
                </div>
            </Button>
        </div>
    );
}