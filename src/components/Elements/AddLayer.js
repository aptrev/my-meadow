import { useEffect, useRef, useCallback, useState } from "react";
import { Layer } from "react-konva";

import Rock from "./Rock";

export default function AddLayer({ stageRef, ref, selected, overCanvas, onAddElement, onAddEnd, scale, sliderValue }) {
    const [position, setPosition] = useState(null);
    const [points, setPoints] = useState([]);
    const rockRef = useRef(null);
    const previewRockRadius = 50;

    const generateRandomPoint = (centerX, centerY, angle = Math.random() * 2 * Math.PI, radius) => {
        const randomRadius = Math.sqrt(Math.random()) * radius;
        const x = centerX + randomRadius * Math.cos(angle);
        const y = centerY + randomRadius * Math.sin(angle);
        return { x, y };
    };

    const generateRandomAngles = (num) => {
        if (!num || num <= 0) {
            return;
        }

        var angles = [];

        var i = 0;
        while (i < num) {
            const angle = Math.random() * 2 * Math.PI;
            if (!angles.includes(angle)) {
                angles.push(angle);
                i++;
            }
        }

        return angles.sort();
    }

    const generateRandomPoints = useCallback((x, y, radius) => {
        const angles = generateRandomAngles(5);
        const points = angles.map((angle) => {
            return generateRandomPoint(x, y, angle, radius);
        });
        return points;
    }, [])

    function usePrevious(value) {
        const ref = useRef()
        useEffect(() => {
            ref.current = value
        })
        return ref.current
    }

    const handleMouseMove = useCallback(
        (e) => {
            if (overCanvas) {
                const stage = stageRef.current;
                stage.setPointersPositions(e);
                const pos = stage.getPointerPosition();
                setPosition({
                    x: pos.x * (1 / stage.scaleX()),
                    y: pos.y * (1 / stage.scaleY()),
                });
                if (selected === 'rock') {
                    setPoints(generateRandomPoints(0, 0, previewRockRadius));
                }
            }

        },
        [overCanvas, stageRef, generateRandomPoints, selected]
    )

    const handleMouseUp = useCallback(
        (e) => {
            if (selected === 'rock') {
                const rock = {
                    id: 'object-' + Date.now(),
                    shape: 'rock',
                    x: position.x,
                    y: position.y,
                    width: sliderValue,
                    height: sliderValue,
                    points: [...points],
                    rotation: 0,
                    draggable: true,
                }
                onAddElement('object', rock);
            }
            onAddEnd();
            document.removeEventListener('mousemove', handleMouseMove);
        },
        [handleMouseMove, onAddEnd, onAddElement, points, position, selected, sliderValue]
    )


    const handleMouseDown = useCallback(
        (e, value) => {
        },
        []
    )

    const prevMouseMove = usePrevious(handleMouseMove);

    useEffect(
        () => {
            document.removeEventListener('mousemove', prevMouseMove);
            if (selected === 'rock') {
                document.addEventListener('mousemove', handleMouseMove)
            }
        },
        [prevMouseMove, handleMouseMove, selected]
    )

    useEffect(
        () => {
            if (selected === 'rock') {
                document.addEventListener('mouseup', handleMouseUp)
            }
            return () => document.removeEventListener('mouseup', handleMouseUp)
        },
        [selected, handleMouseUp]
    )

    return (
        <Layer ref={ref} >
            {selected === 'rock' && overCanvas &&
                <Rock   
                    id='add-rock-preview'
                    x={position ? position.x : 0}
                    y={position ? position.y : 0}
                    shapeProps={{
                        ref: rockRef,
                        width: previewRockRadius,
                        height: previewRockRadius,
                        points: points,
                        visible: (selected === 'rock' && overCanvas),
                        opacity: 0.5,
                    }} />
            }
        </Layer>
    );
}