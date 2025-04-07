import { Circle, Arc, Ellipse, Line, Path, Rect, RegularPolygon, Ring, Star, Wedge } from 'react-konva';

export default function Plot({ id, shape, shapeProps, plant, plant_species, onDragEnd, plotRefs }) {

    const getFill = () => {
        const p = plant_species.find(p => p.id === plant);
        if (!p)
            return 'white'
        return p.color;
    }

    const generatePlot = () => {
        const defaultProps = {
            id,
            fill: getFill(),
            stroke: 'black',
            strokeWidth: 4,
            onDragEnd: (e) => onDragEnd(e),
            ref: (node) => {
                if (node) {
                    plotRefs.current.set(id, node);
                }
            }
        }

        switch (shape) {
            case 'arc': return <Arc key={shapeProps.id} {...shapeProps} {...defaultProps} />
            case 'ellipse': return <Ellipse key={shapeProps.id} {...shapeProps} {...defaultProps} />
            case 'line': return <Line key={shapeProps.id} {...shapeProps} {...defaultProps} closed />
            case 'rect': return <Rect key={shapeProps.id} {...shapeProps} {...defaultProps} />
            case 'polygon': return <RegularPolygon key={shapeProps.id} {...shapeProps} {...defaultProps} />
            case 'ring': return <Ring key={shapeProps.id} {...shapeProps} {...defaultProps} />
            case 'star': return <Star key={shapeProps.id} {...shapeProps} {...defaultProps} />
            case 'wedge': return <Wedge key={shapeProps.id} {...shapeProps} {...defaultProps} />
            case 'path': return <Path key={shapeProps.id} {...shapeProps} {...defaultProps} />
            case 'circle':
            default: return <Circle {...shapeProps} {...defaultProps} />
        }
    }

    return (
        <>
            {generatePlot()}
        </>
    )
}
