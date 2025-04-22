import { Group, Line } from "react-konva";

export default function Grid({ width, height, cellWidth, cellHeight }) {

    const vertical = [];
    for (let i = cellWidth; i <= width; i += cellWidth) {
        vertical.push(
            <Line
                key={`v-${i}`}
                points={[i, 0, i, height]}
                stroke='black'
                strokeWidth={0.25}
            />
        );
    }

    const horizontal = [];
    for (let i = cellHeight; i <= height; i += cellHeight) {
        horizontal.push(
            <Line
                key={`h-${i}`}
                points={[0, i, width, i]}
                stroke='black'
                strokeWidth={0.25}
            />
        );
    }

    return <Group>
        {vertical}
        {horizontal}
    </Group>;
};