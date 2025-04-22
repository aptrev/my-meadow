import {
    Group, Shape, Circle, Arc, Ellipse, Line, Path, Rect, RegularPolygon, Ring, Star, Wedge, Image
} from 'react-konva';
import React, { useState, useRef, useEffect } from 'react';
import useImage from 'use-image';
import dirt from '../../assets/images/decor/dirt.png'

const URLImage = ({ src, ...props }) => {
    const [image] = useImage(require(`../../assets/images/plants/${src}`));

    return (
        <Image
            image={image}
            {...props}
        />
    );
};

export default function Plot({ id, shape, x, y, rotation, shapeProps, plant, plants, 
    onDrag, onDragEnd, onDragStart, onTransformEnd, elementRefs, draggable, scaleX, scaleY }) {
    // const [cloversBackground] = useImage(require(clovers));
    const shapeRef = useRef(null);
    const [image, setImage] = useState(null);
    const [patternImage, setPatternImage] = useState(null);

    useEffect(() => {
        const image = new window.Image();
        image.src = dirt;
        image.onload = () => {
            setPatternImage(image);
        };
    }, []);

    useEffect(() => {
        if (shapeRef.current) {
            elementRefs.current.set(id, shapeRef.current);
        }
    }, [id, elementRefs]);

    useEffect(() => {
        if (plant && plants) {
            const plantObject = plants.find(p => p.id === plant)
            setImage(plantObject.image);
        }
    }, [plants, plant]);

    const generatePlot = () => {
        const defaultProps = {
            id,
            x: 0,
            y: 0,
            // fill: 'white',
            stroke: 'black',
            strokeWidth: 2,
            shadowColor: 'rgba(0,0,0,0.25)',
            shadowBlur: 20,
            shadowOffsetX: 5,
            shadowOffsetY: 10,
            strokeScaleEnabled: false,
            // fillPatternImage: {patternImage},
            // fillPatternRepeat: 'repeat',
            // fillPatternScaleX: 1,
            // fillPatternScaleY: 1,   
        }

        switch (shape) {
            case 'arc': return <Arc key={id} {...shapeProps} {...defaultProps}
                fillPatternImage={patternImage}
                fillPatternRepeat='repeat'
                fillPatternScaleX={shapeProps.randomFillScaleX}
                fillPatternScaleY={shapeProps.randomFillScaleY}
                fillPatternRotation={shapeProps.randomFillRotation} />;
            case 'ellipse': return <Ellipse key={id} {...shapeProps} {...defaultProps}
                fillPatternImage={patternImage}
                fillPatternRepeat='repeat'
                fillPatternScaleX={shapeProps.randomFillScaleX}
                fillPatternScaleY={shapeProps.randomFillScaleY}
                fillPatternRotation={shapeProps.randomFillRotation} />;
            case 'line': return <Line key={id} {...shapeProps} {...defaultProps}
                fillPatternImage={patternImage}
                fillPatternRepeat='repeat'
                fillPatternScaleX={shapeProps.randomFillScaleX}
                fillPatternScaleY={shapeProps.randomFillScaleY}
                fillPatternRotation={shapeProps.randomFillRotation} closed />;
            case 'rect': return <Rect key={id} {...shapeProps} {...defaultProps}
                fillPatternImage={patternImage}
                fillPatternRepeat='repeat'
                fillPatternScaleX={shapeProps.randomFillScaleX}
                fillPatternScaleY={shapeProps.randomFillScaleY}
                fillPatternRotation={shapeProps.randomFillRotation} />;
            case 'polygon': return <RegularPolygon key={id} {...shapeProps} {...defaultProps}
                fillPatternImage={patternImage}
                fillPatternRepeat='repeat'
                fillPatternScaleX={shapeProps.randomFillScaleX}
                fillPatternScaleY={shapeProps.randomFillScaleY}
                fillPatternRotation={shapeProps.randomFillRotation} />;
            case 'ring': return <Ring key={id} {...shapeProps} {...defaultProps}
                fillPatternImage={patternImage}
                fillPatternRepeat='repeat'
                fillPatternScaleX={shapeProps.randomFillScaleX}
                fillPatternScaleY={shapeProps.randomFillScaleY}
                fillPatternRotation={shapeProps.randomFillRotation} />;
            case 'star': return <Star key={id} {...shapeProps} {...defaultProps}
                fillPatternImage={patternImage}
                fillPatternRepeat='repeat'
                fillPatternScaleX={shapeProps.randomFillScaleX}
                fillPatternScaleY={shapeProps.randomFillScaleY}
                fillPatternRotation={shapeProps.randomFillRotation} />;
            case 'wedge': return <Wedge key={id} {...shapeProps} {...defaultProps}
                fillPatternImage={patternImage}
                fillPatternRepeat='repeat'
                fillPatternScaleX={shapeProps.randomFillScaleX}
                fillPatternScaleY={shapeProps.randomFillScaleY}
                fillPatternRotation={shapeProps.randomFillRotation} />;
            case 'path': return <Path key={id} {...shapeProps} {...defaultProps}
                fillPatternImage={patternImage}
                fillPatternRepeat='repeat'
                fillPatternScaleX={shapeProps.randomFillScaleX}
                fillPatternScaleY={shapeProps.randomFillScaleY}
                fillPatternRotation={shapeProps.randomFillRotation} />;
            case 'circle': return <Circle key={id} {...shapeProps} {...defaultProps}
                fillPatternImage={patternImage}
                fillPatternRepeat='repeat'
                fillPatternScaleX={shapeProps.randomFillScaleX}
                fillPatternScaleY={shapeProps.randomFillScaleY}
                fillPatternRotation={shapeProps.randomFillRotation} />
            default: return <Shape key={id} {...shapeProps} {...defaultProps}
                fillPatternImage={patternImage}
                fillPatternRepeat='repeat'
                fillPatternScaleX={shapeProps.randomFillScaleX}
                fillPatternScaleY={shapeProps.randomFillScaleY}
                fillPatternRotation={shapeProps.randomFillRotation} />;
        }
    };

    const getImagePosition = () => {
        switch (shape) {
            case 'ellipse': return {x: -(shapeProps.radius.x / 3), y: -(shapeProps.radius.y / 3)};
            case 'ring': return {x: -(shapeProps.innerRadius / 2), y: -(shapeProps.outerRadius)};
            case 'rect': return {x: 5, y: 5}
            case 'star': return {x: -(shapeProps.innerRadius / 2), y: -(shapeProps.innerRadius / 2)};
            case 'polygon':
            case 'circle': return {x: -(shapeProps.radius / 2), y: -(shapeProps.radius / 2),};
            case 'path': return {x: scaleX * 85, y: scaleY * 85};
            default: return {x: 0, y: 0};
        }
    }

    return (
        <Group
            id={id}
            x={x}
            y={y}
            rotation={rotation}
            shape={shape}
            name={'plot'}
            draggable={draggable}
            onTransformEnd={onTransformEnd}
            // onDragMove={(e) => onDrag(e)}
            onDragEnd={(e) => onDragEnd(e)}
            // onDragStart={(e) => onDragEnd(e)}
            scaleX={scaleX}
            scaleY={scaleY}
            ref={(node) => {
                if (node) {
                    elementRefs.current.set(id, node);
                }
            }}
        >
            {generatePlot()}
            {(plant && image) &&
                <URLImage
                    src={image}
                    x={getImagePosition().x}
                    y={getImagePosition().y}
                    width={30}
                    height={30}
                    scaleX={1 / scaleX}
                    scaleY={1 / scaleY}
                    listening={false} />
            }
        </Group>
    );
}