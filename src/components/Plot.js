import {
    Circle, Arc, Ellipse, Line, Path, Rect, RegularPolygon, Ring, Star, Wedge, Image
} from 'react-konva';
import React, { useRef, useEffect } from 'react';
import useImage from 'use-image';

export default function Plot({ id, shape, shapeProps, plant, plant_species, onDragEnd, plotRefs }) {
    const shapeRef = useRef(null);

    useEffect(() => {
        if (shapeRef.current) {
            plotRefs.current.set(id, shapeRef.current);
        }
    }, [id, plotRefs]);

    const plantInfo = plant_species.find(p => p.id === plant);
    const [plantImg] = useImage(plantInfo ? require(`../assets/images/${plantInfo.src}`) : null);

    const getFill = () => {
        if (!plantInfo) return 'white';
        return plantInfo.color;
    };

    const defaultProps = {
        id,
        fill: getFill(),
        stroke: 'black',
        strokeWidth: 4,
        onDragEnd: (e) => onDragEnd(e),
        ref: shapeRef,
        draggable: true,
        name: 'plot'
    };

    const generatePlot = () => {
        const defaultProps = {
            id,
            fill: getFill(),
            stroke: 'black',
            strokeWidth: 2,
            onDragEnd: (e) => onDragEnd(e),
            ref: (node) => {
                if (node) {
                    plotRefs.current.set(id, node);
                }
            }
        }

        switch (shape) {
            case 'arc': return <Arc key={id} {...shapeProps} {...defaultProps} />;
            case 'ellipse': return <Ellipse key={id} {...shapeProps} {...defaultProps} />;
            case 'line': return <Line key={id} {...shapeProps} {...defaultProps} closed />;
            case 'rect': return <Rect key={id} {...shapeProps} {...defaultProps} />;
            case 'polygon': return <RegularPolygon key={id} {...shapeProps} {...defaultProps} />;
            case 'ring': return <Ring key={id} {...shapeProps} {...defaultProps} />;
            case 'star': return <Star key={id} {...shapeProps} {...defaultProps} />;
            case 'wedge': return <Wedge key={id} {...shapeProps} {...defaultProps} />;
            case 'path': return <Path key={id} {...shapeProps} {...defaultProps} />;
            case 'circle':
            default: return <Circle key={id} {...shapeProps} {...defaultProps} />;
        }
    };

    return (
        <>
            {generatePlot()}
            {plantImg && (
                <Image
                    image={plantImg}
                    x={shapeProps.x}
                    y={shapeProps.y}
                    width={30}
                    height={30}
                    listening={false} // prevents interaction interference
                />
            )}
        </>
    );
}