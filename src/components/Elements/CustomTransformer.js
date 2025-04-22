import React from 'react';
import { Transformer } from 'react-konva';

/**
     * Helper function to return element from elements based on id
     * @param {string} id 
     * @returns element - plot, path, object or text
     */
const getElementIndex = (id, elems) => {
    return elems.findIndex(r => r.id === id);
}

export default function CustomTransformer({ ref, elements, setElements, saveHistory, selectedShapes, selectedIds, grabbing, ...props }) {

    // Handle element resizing and rotation, set new plots and save to history
    const handleTransformEnd = (e) => {
        // Get nodes of selected elements
        var nodes = ref.current.nodes();
        console.log(nodes);

        const newElements = { ...elements };

        if (nodes.length === 0) {
            nodes.push(e.target);
        }

        // Set new transformed data to elements, necessary as transformation
        // set scale, which changes stroke width (not what we want)
        nodes.forEach(node => {
            const id = node.id();
            const name = node.name();

            const newProps = {
                x: node.x(),
                y: node.y(),
                scaleX: node.scaleX(),
                scaleY: node.scaleY(),
                rotation: node.rotation(),
            }

            if (name === 'plot') {
                const index = getElementIndex(id, [...elements.plots]);

                if (index !== -1) {
                    const newElement = {
                        ...elements.plots[index],
                        ...newProps,
                    }

                    newElements.plots[index] = {
                        ...newElement
                    }
                }
            } else if (name === 'object') {
                const index = getElementIndex(id, [...elements.objects]);

                if (index !== -1) {
                    const newElement = {
                        ...elements.objects[index],
                        ...newProps,
                    }

                    newElements.objects[index] = {
                        ...newElement
                    }
                }
            }

        });

        setElements(newElements);
        saveHistory(newElements);
    };

    return (
        <Transformer
            {...props}
            ref={ref}
            boundBoxFunc={(oldBox, newBox) => {
                // Limit resize
                if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                }
                return newBox;
            }}
            onTransformEnd={handleTransformEnd}
            borderStroke="green"
            anchorStroke="#3B6255"
            anchorStrokeWidth={2}
            anchorStyleFunc={(anchor) => {
                const multipleSelections = selectedIds.length > 1;
                const squareShapeSelected = selectedShapes.size === 1 &&
                    (selectedShapes.has('circle') || selectedShapes.has('regularpolygon') ||
                        selectedShapes.has('arc') || selectedShapes.has('ring') ||
                        selectedShapes.has('wedge') || selectedShapes.has('path') ||
                        selectedShapes.has('star'));

                if (grabbing) {
                    if (anchor.hasName('top-center') ||
                        anchor.hasName('bottom-center') ||
                        anchor.hasName('middle-left') ||
                        anchor.hasName('middle-right') ||
                        anchor.hasName('top-left') ||
                        anchor.hasName('top-right') ||
                        anchor.hasName('bottom-left') ||
                        anchor.hasName('bottom-right')) {
                        anchor.scale({ x: 0, y: 0 });
                    }
                } else if (multipleSelections || squareShapeSelected) {
                    if (anchor.hasName('top-center') ||
                        anchor.hasName('bottom-center') ||
                        anchor.hasName('middle-left') ||
                        anchor.hasName('middle-right')) {
                        anchor.scale({ x: 0, y: 0 });
                    }

                    if (anchor.hasName('top-left') ||
                        anchor.hasName('top-right') ||
                        anchor.hasName('bottom-left') ||
                        anchor.hasName('bottom-right')) {
                        anchor.scale({ x: 1, y: 1 });
                    }
                } else {
                    anchor.scale({ x: 1, y: 1 });
                    // if (anchor.hasName('top-center') ||
                    //     anchor.hasName('bottom-center') ||
                    //     anchor.hasName('middle-left') ||
                    //     anchor.hasName('middle-right')) {
                    //     anchor.scale({ x: 1, y: 1 });
                    // }
                }


            }}
        />
    );
};