import { newCircle, newEllipse, newTriangle, newRect, newPolygon, newStar, newRing, newArc, newWedge, newLonghorn } from '../utilities/Shapes';
import marigold from '../assets/images/marigold.png'
import magnolia from '../assets/images/magnolia.png'
import begonia from '../assets/images/begonia.png'
import rose from '../assets/images/rose.png'
import circle from '../assets/images/plots/circle.png'
import square from '../assets/images/plots/square.png'
import star from '../assets/images/plots/star.png'
import ring from '../assets/images/plots/ring.png'
import arc from '../assets/images/plots/arc.png'
import wedge from '../assets/images/plots/wedge.png'
import ellipse from '../assets/images/plots/ellipse.png'
import triangle from '../assets/images/plots/triangle.png'
import polygon from '../assets/images/plots/polygon.png'
import longhorn from '../assets/images/plots/paths/longhorn.png'

const plotOptions = {
    tool: 'plot',
    options: [
        {
            id: 'picker-rect-element',
            name: 'Rectangle',
            value: 'rect',
            src: square,
            format: 'png',
            shape: newRect,
        },
        {
            id: 'picker-circle-element',
            name: 'Circle',
            value: 'circle',
            src: circle,
            format: 'png',
            shape: newCircle,
        },
        {
            id: 'picker-ellipse-element',
            name: 'Ellipse',
            value: 'ellipse',
            src: ellipse,
            format: 'png',
            shape: newEllipse,
        },
        // {
        //     id: 'picker-triangle-element',
        //     name: 'Triangle',
        //     value: 'triangle',
        //     src: triangle,
        //     format: 'png',
        //     shape: newTriangle,
        // },
        {
            id: 'picker-polygon-element',
            name: 'Polygon',
            value: 'polygon',
            src: polygon,
            format: 'png',
            shape: newPolygon,
        },
        {
            id: 'picker-ring-element',
            name: 'Ring',
            value: 'ring',
            src: ring,
            format: 'png',
            shape: newRing,
        },
        {
            id: 'picker-arc-element',
            name: 'Arc',
            value: 'arc',
            src: arc,
            format: 'png',
            shape: newArc,
        },
        {
            id: 'picker-wedge-element',
            name: 'Wedge',
            value: 'wedge',
            src: wedge,
            format: 'png',
            shape: newWedge,
        },
        {
            id: 'picker-star-element',
            name: 'Star',
            value: 'star',
            src: star,
            format: 'png',
            shape: newStar,
        },
        {
            id: 'picker-longhorn-element',
            name: 'Longhorn',
            value: 'longhorn',
            src: longhorn,
            format: 'png',
            shape: newLonghorn,
        },
    ],
}

const plantOptions = {
    tool: 'plants',
    options: [
        {
            id: 1473,
            name: "Marigold",
            src: marigold,
            color: 'orange',
            format: 'png',
            value: 1473,
        },
        {
            id: 324,
            name: "Magnolia",
            src: magnolia,
            color: 'beige',
            format: 'png',
            value: 324,
        },
        {
            id: 1194,
            name: 'Begonia',
            src: begonia,
            color: 'pink',
            format: 'png',
            value: 1194,
        },
        {
            id: 6791,
            name: 'Rose',
            src: rose,
            color: 'red',
            format: 'png',
            value: 6791,
        },
    ],
}

export {plotOptions, plantOptions}