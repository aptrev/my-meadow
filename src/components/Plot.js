import {
    Shape, Circle, Arc, Ellipse, Line, Path, Rect, RegularPolygon, Ring, Star, Wedge, Image
} from 'react-konva';
import React, { useRef, useEffect } from 'react';
import useImage from 'use-image';

export default function Plot({ id, shape, shapeProps, plant, plant_species, onDragEnd, plotRefs }) {
    // const [cloversBackground] = useImage(require(clovers));
    const shapeRef = useRef(null);

    useEffect(() => {
        if (shapeRef.current) {
            plotRefs.current.set(id, shapeRef.current);
        }
    }, [id, plotRefs]);

    const plantInfo = plant_species.find(p => p.id === plant);
    const [plantImg] = useImage(plantInfo?.src || null);

    const getFill = () => {
        if (!plantInfo) return 'white';
        return plantInfo.color;
    };

    const generatePlot = () => {
        const defaultProps = {
            id,
            fill: 'white',
            stroke: 'black',
            strokeWidth: 2,
            onDragEnd: (e) => onDragEnd(e),
            ref: (node) => {
                if (node) {
                    plotRefs.current.set(id, node);
                }
            },
            shadowColor: 'rgba(0,0,0,0.25)',
            shadowBlur: 20,
            shadowOffsetX: 5,
            shadowOffsetY: 10,
            // fillPatternImage: <img src={clovers} alt='clovers' />
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
            case 'circle': return <Circle key={id} {...shapeProps} {...defaultProps} />
            default: return <Shape key={id} {...shapeProps} {...defaultProps} />;
        }
    };

    return (
        <>
            {generatePlot()}
            {plantImg && (
                <Image
                    image={plantImg}
                    x={shapeProps.x - 25}
                    y={shapeProps.y - 25}
                    width={50}
                    height={50}
                    listening={false} // prevents interaction interference
                />
            )}
            {/* <Image 
            src={cloversBackground} alt='clovers'
            width={20}
            height={20} /> */}
        </>
    );
}