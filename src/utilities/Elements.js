import { newCircle, newRect, newStar } from '../utilities/Shapes';
import marigold from '../assets/images/marigold.png'
import magnolia from '../assets/images/magnolia.png'
import begonia from '../assets/images/begonia.png'
import rose from '../assets/images/rose.png'
import circle from '../assets/images/plots/circle.svg'
import square from '../assets/images/plots/square.svg'
import star from '../assets/images/plots/star.svg'

const plant_elements = {
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
        }
    ],
}

const plot_options = {
    tool: 'plot',
    options: [
        {
            id: 'toolbar-circle-element',
            name: 'Circle',
            value: 'circle',
            src: circle,
            format: 'svg',
        },
        {
            id: 'toolbar-rect-element',
            name: 'Rectangle',
            value: 'rect',
            src: square,
            format: 'svg',
        },
        {
            id: 'toolbar-star-element',
            name: 'Star',
            value: 'star',
            src: star,
            format: 'svg',
        },
    ],
}

const getElements = (tool) => {
    if (!tool) {
        console.error('No tool selected');
        return null
    }
    
}

export {getElements}