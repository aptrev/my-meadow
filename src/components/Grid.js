import { Group, Line } from "react-konva";

export default function Grid({width, height, cellWidth, cellHeight}) {

    const verticalLines = [];
    for (let i = 0; i <= width; i += cellWidth) {
        verticalLines.push(
            <Line
                key={`v-${i}`}
                points={[i, 0, i, height]}
                stroke='black'
                strokeWidth={0.25}
            />
        );
    }

    const horizontalLines = [];
    for (let i = 0; i <= height; i += cellHeight) {
        horizontalLines.push(
            <Line
                key={`h-${i}`}
                points={[0, i, width, i]}
                stroke='black'
                strokeWidth={0.25}
            />
        );
    }

    return <Group>{verticalLines}{horizontalLines}</Group>;
};