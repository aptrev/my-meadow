import {
    Group, Shape, Circle, Arc, Ellipse, Line, Path, Rect, RegularPolygon, Ring, Star, Wedge, Image, Text
} from 'react-konva';
import React, { useState, useRef, useEffect } from 'react';
import useImage from 'use-image';

const URLImage = ({ src, ...props }) => {
    const [image, status] = useImage(require(`../assets/images/plants/${src}`));

    return (
        <Image
            image={image}
            {...props}
        />
    );
};

export default function Plot({ id, shape, x, y, rotation, shapeProps, plant, plants, onDragEnd, plotRefs, draggable }) {
    // const [cloversBackground] = useImage(require(clovers));
    const shapeRef = useRef(null);
    const [image, setImage] = useState(null);

    useEffect(() => {
        if (shapeRef.current) {
            plotRefs.current.set(id, shapeRef.current);
        }
    }, [id, plotRefs]);

    // const plantInfo = plant_species.find(p => p.id === plant);
    // const [plantImg] = useImage(plants.find(p => p.id === plant).image || null);

    useEffect(() => {
        if (plant && plants) {
            const plantObject = plants.find(p => p.id === plant)
            setImage(plantObject.image);
        }
    }, [plants, plant]);

    const getFill = () => {
        return 'white';
    };

    const generatePlot = () => {
        const defaultProps = {
            id,
            x: 0,
            y: 0,
            fill: 'white',
            stroke: 'black',
            strokeWidth: 2,
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
        <Group
            id={id}
            x={x}
            y={y}
            rotation={rotation}
            shape={shape}
            name={shape}
            draggable={draggable}
            onDragEnd={(e) => onDragEnd(e)}
            ref={(node) => {
                if (node) {
                    plotRefs.current.set(id, node);
                }}}
            >
            {generatePlot()}
            {/* {plantImg && (
                <Image
                    image={plantImg}
                    x={shapeProps.x - 25}
                    y={shapeProps.y - 25}
                    width={50}
                    height={50}
                    listening={false} // prevents interaction interference
                />
            )} */}
            {/* {(plant) &&
                <Text
                    text={plant}
                    x={shapeProps.x - 30}
                    y={shapeProps.y - 10}
                    // width={50}
                    // height={50}
                    fontSize={30}
                    fontFamily="Inter"
                    fill="black"
                    listening={false} />
            } */}
            {(plant && image) &&
                <URLImage
                    src={image}
                    x={0}
                    y={0}
                    width={40}
                    height={40}
                    listening={false} />
            }
        </Group>
    );
}