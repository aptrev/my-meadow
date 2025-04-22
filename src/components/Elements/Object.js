import { Group } from 'react-konva';
import React, { useRef, useEffect } from 'react';
import Fence from './Fence'
import Rock from './Rock'

export default function Object({ id, shape, x, y, scaleX, scaleY, rotation, 
    onDrag, onDragEnd, onDragStart, onTransformEnd, elementRefs, draggable, shapeProps}) {
    const shapeRef = useRef(null);

    useEffect(() => {
        if (shapeRef.current) {
            elementRefs.current.set(id, shapeRef.current);
        }
    }, [id, elementRefs]);

    const generateObject = () => {
        const defaultProps = {
            id,
            x: 0,
            y: 0,
            shapeProps,
        }

        switch (shape) {
            case 'rock': return <Rock {...defaultProps}  />;
            case 'fence': return <Fence {...defaultProps} />;
            default: return <Rock {...defaultProps} />;
        }
    };

    return (
        <Group
            id={id}
            x={x}
            y={y}
            rotation={rotation}
            shape={shape}
            name={'object'}
            scaleX={scaleX}
            scaleY={scaleY}
            draggable={draggable}
            // onDragMove={(e) => onDrag(e)}
            onDragEnd={(e) => onDragEnd(e)}
            // onDragStart={(e) => onDragEnd(e)}
            onTransformEnd={onTransformEnd}
            ref={(node) => {
                if (node) {
                    elementRefs.current.set(id, node);
                }
            }}
        >
            {generateObject()}
        </Group>
    );
}