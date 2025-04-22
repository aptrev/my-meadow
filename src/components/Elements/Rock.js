import React, { useRef } from 'react';
import { Shape } from 'react-konva';

export default function Rock({ id, x, y, shapeProps, ...props }) {
    const { width, height, points, ...restProps } = shapeProps;
    const shapeRef = useRef(null);

    React.useEffect(() => {
        if (shapeRef.current) {
            shapeRef.current.getSelfRect = () => {
                var minX = Infinity;
                var minY = Infinity;
                var maxX = -Infinity;
                var maxY = -Infinity;
    
                for (var i = 0; i < points.length; i++) {
                    minX = Math.min(minX, points[i].x);
                    minY = Math.min(minY, points[i].y);
                    maxX = Math.max(maxX, points[i].x);
                    maxY = Math.max(maxY, points[i].y);
                }
    
                console.log(minX + ' ' + minY);
                // Define the bounding box of the shape
                return {
                    x: minX,
                    y: minY,
                    width: maxX - minX,
                    height: maxY - minY,
                };
           }
        }
    }, [x, y, width, height, points]);

    const defaultProps = {
        id,
        x,
        y,
        width,
        height,
        name: 'object',
        fill: 'white',
        stroke: 'black',
        strokeWidth: 1,
        shadowColor: 'rgba(0,0,0,0.25)',
        shadowBlur: 20,
        shadowOffsetX: 5,
        shadowOffsetY: 10,
        strokeScaleEnabled: false,
    }

    return (
        <>
            {(points.length >= 3) &&
                <Shape
                    {...defaultProps}
                    {...restProps}
                    tension={0.3}
                    closed={true}
                    sceneFunc={(context, shape) => {
                        context.beginPath();
                        context.moveTo(points[0].x, points[0].y);

                        for (let i = 1; i < points.length; i++) {
                            context.lineTo(points[i].x, points[i].y);
                        }

                        context.closePath();
                        context.fillStrokeShape(shape);
                    }}
                    ref={shapeRef}
                />
            }
        </>
    );
};