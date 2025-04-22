import {
    Shape, Group, Rect
} from 'react-konva';
import React, { useRef, useEffect } from 'react';

const POST_WIDTH = 10;
const PICKET_WIDTH = 5;
const POST_DIAG_WIDTH = (POST_WIDTH * Math.sqrt(2)) / 2;

function Post({ point }) {
    const width = POST_WIDTH;

    return <Rect
        x={point.x}
        y={point.y}
        width={width}
        height={width}
        stroke='black'
        strokeWidth={1}
        fill='white'
    />
}

function Picket({ start, end }) {
    const actual_start = {
        x: start.x + POST_DIAG_WIDTH / 2,
        y: start.y + POST_DIAG_WIDTH / 2 - PICKET_WIDTH / 4,
    };
    const actual_end = {
        x: end.x + POST_DIAG_WIDTH / 2,
        y: end.y + POST_DIAG_WIDTH / 2 - PICKET_WIDTH / 4,
    };
    const width = PICKET_WIDTH;
    const length = Math.sqrt((actual_end.x - actual_start.x) ** 2 + (actual_end.y - actual_start.y) ** 2);

    const getRotation = () => {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const radians = Math.atan2(dy, dx);
        const degrees = radians * (180 / Math.PI);
        return degrees;
    }

    return <Rect
        x={actual_start.x}
        y={actual_start.y}
        width={length}
        height={width}
        stroke='black'
        strokeWidth={1}
        fill='white'
        rotation={getRotation()}
    />
}

export default function Fence({ id, endpoints }) {
    var points = [];
    endpoints.forEach((endpoint, index) => {
        points.push(endpoint.start);
        if (index === endpoints.length - 1) {
            points.push(endpoint.end);
        }
    })

    return (
        <Group
            draggable={true}>
            {/* Render Pickets/Boards */}
            {endpoints.map((endpoint, index) => {
                return <Picket key={'picket-' + index} start={endpoint.start} end={endpoint.end} />
            })}
            {/* Render posts */}
            {points.map((point, index) => {
                return <Post key={'post-' + index} point={point} />;
            })}
        </Group>
    );
}

