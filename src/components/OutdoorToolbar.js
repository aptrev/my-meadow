import { useState, useEffect, useCallback, useRef } from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button'
import { Toolbar } from "radix-ui";
import { Collapsible } from "radix-ui";
import { PlusCircle, Flower2, XLg, Circle, Square, Star, ArrowCounterclockwise, ArrowClockwise } from 'react-bootstrap-icons';
import Overlay from 'react-bootstrap/Overlay';
import "../style/toolbar.css";

export default function OutdoorToolbar({
    onUndo, onRedo,
    plotRef, setPlot, onPlotDragStart, onPlotDrag, onPlotDragEnd,
    plantRef, setPlant, plants, onPlantDragStart, onPlantDrag, onPlantDragEnd, onPlantClick}) {
    const [tool, setTool] = useState(0);
    const [element, setElement] = useState(null);

    const [openPlots, setOpenPlots] = useState(false);
    const [openPlants, setOpenPlants] = useState();

    const [isPlotDragging, setIsPlotDragging] = useState(false)
    const [isPlantDragging, setIsPlantDragging] = useState(false)
    const [position, setPosition] = useState({
        x: 0,
        y: 0
    });

    function getPos(e) {
        return {
            x: e.pageX,
            y: e.pageY,
        }
    }

    function usePrevious(value) {
        const ref = useRef()
        useEffect(() => {
            ref.current = value
        })
        return ref.current
    }


    const handleOpenPlots = () => {
        if (openPlots) {
            setOpenPlots(false);
        } else {
            setOpenPlants(false);
            setOpenPlots(true);
        }

    }

    const handleOpenPlants = () => {
        if (openPlants) {
            setOpenPlants(false);
        } else {
            setOpenPlots(false);
            setOpenPlants(true);
        }
    }

    const handlePlotMouseMove = useCallback(
        (e) => {
            setPosition(getPos(e));
            onPlotDrag(e, getPos(e));
        },
        [onPlotDrag]
    )

    const handlePlotMouseUp = useCallback(
        (e) => {
            onPlotDragEnd(e, getPos(e));
            setIsPlotDragging(false);
            document.removeEventListener('mousemove', handlePlotMouseUp);

        },
        [onPlotDragEnd]
    )

    const handlePlotMouseDown = useCallback(
        (e, value) => {

            onPlotDragStart(e, getPos(e))
            setPlot(value);
            setIsPlotDragging(true);
            document.addEventListener('mousemove', handlePlotMouseMove)
        },
        [onPlotDragStart, setPlot, handlePlotMouseMove]
    )

    const prevPlotMouseMove = usePrevious(handlePlotMouseMove)

    useEffect(
        () => {
            document.removeEventListener('mousemove', prevPlotMouseMove);
            if (isPlotDragging) {
                document.addEventListener('mousemove', handlePlotMouseMove)
            }
        },
        [prevPlotMouseMove, handlePlotMouseMove, isPlotDragging]
    )

    useEffect(
        () => {
            if (isPlotDragging) {
                document.addEventListener('mouseup', handlePlotMouseUp)
            }
            return () => document.removeEventListener('mouseup', handlePlotMouseUp)
        },
        [isPlotDragging, handlePlotMouseUp]
    )

    // Plants
    const handlePlantMouseMove = useCallback(
        (e) => {
            setPosition(getPos(e));
            onPlantDrag(e, getPos(e));
        },
        [onPlantDrag]
    )

    const handlePlantMouseUp = useCallback(
        (e) => {
            onPlantDragEnd(e, getPos(e));
            setIsPlantDragging(false);
            document.removeEventListener('mousemove', handlePlantMouseUp);

        },
        [onPlantDragEnd]
    )

    const handlePlantMouseDown = useCallback(
        (e, value) => {

            onPlantDragStart(e, getPos(e))
            setPlant(value);
            setIsPlantDragging(true);
            document.addEventListener('mousemove', handlePlantMouseMove)
        },
        [onPlantDragStart, setPlant, handlePlantMouseMove]
    )

    const prevPlantMouseMove = usePrevious(handlePlantMouseMove)

    useEffect(
        () => {
            document.removeEventListener('mousemove', prevPlantMouseMove);
            if (isPlantDragging) {
                document.addEventListener('mousemove', handlePlantMouseMove)
            }
        },
        [prevPlantMouseMove, handlePlantMouseMove, isPlantDragging]
    )

    useEffect(
        () => {
            if (isPlantDragging) {
                document.addEventListener('mouseup', handlePlantMouseUp)
            }
            return () => document.removeEventListener('mouseup', handlePlantMouseUp)
        },
        [isPlantDragging, handlePlantMouseUp]
    )

    const getShape = () => {

        if (isPlotDragging) {
            switch (plotRef.current) {
                case 'rect': return <Square
                    size={64}
                    style={{
                        display: (isPlotDragging) ? 'block' : 'none',
                        position: 'absolute',
                        left: position.x,
                        top: position.y,
                        cursor: 'grab',
                        color: 'var(--primaryDarkGreen)',
                        zIndex: 1001,
                    }}
                />
                case 'star': return <Star
                    size={64}
                    style={{
                        display: (isPlotDragging) ? 'block' : 'none',
                        position: 'absolute',
                        left: position.x,
                        top: position.y,
                        cursor: 'grab',
                        color: 'var(--primaryDarkGreen)',
                        zIndex: 1001,
                    }}
                />
                case 'circle':
                default: return <Circle
                    size={64}
                    style={{
                        display: (isPlotDragging) ? 'block' : 'none',
                        position: 'absolute',
                        left: position.x,
                        top: position.y,
                        cursor: 'grab',
                        color: 'var(--primaryDarkGreen)',
                        zIndex: 1001,
                    }}
                />
            }
        } else if (isPlantDragging) {
            const plant = plants.find(({ id }) => {
                return id === plantRef.current;
            });
            return <img
                alt={plant.name}
                src={require('../assets/images/' + plant.src)}
                style={{
                    display: (isPlantDragging) ? 'block' : 'none',
                    height: '24px',
                    width: '24px',
                    position: 'absolute',
                    left: position.x,
                    top: position.y,
                    cursor: 'grab',
                    color: 'var(--primaryDarkGreen)',
                    zIndex: 1001,
                }}
            />
        }
    }

    return (
        <div className='d-flex f-row'>
            {getShape()}

            <Toolbar.Root className="ToolbarRoot position-relative my-2">
                <ButtonGroup className='d-flex d-row justify-content-center'>
                    <Collapsible.Root
                        className="CollapsibleRoot position-relative"
                        style={{ zIndex: 1000 }}
                        open={openPlots}
                        onOpenChange={handleOpenPlots}>
                        <Collapsible.Trigger className='collapsible-trigger' asChild>
                            <Button
                                className={`${openPlots ? 'active' : ''} d-flex align-items-center`}
                                variant='toolbar'
                            >
                                {openPlots ? <XLg size={24} /> : <PlusCircle size={24} />}
                            </Button>
                        </Collapsible.Trigger>
                        <Collapsible.Content
                            className='d-flex flex-row mt-4 position-absolute'
                        >
                            {/* Circle */}
                            <Button
                                className='d-flex align-items-center'
                                variant='element'
                                draggable='true'
                                onMouseMove={handlePlotMouseMove}
                                onMouseDown={(e) => handlePlotMouseDown(e, 'circle')}
                                onMouseUp={handlePlotMouseUp}
                            >
                                <Circle size={24} />
                            </Button>
                            {/* Rectangle */}
                            <Button
                                className='d-flex align-items-center ms-2'
                                variant='element'
                                draggable='true'
                                onMouseMove={handlePlotMouseMove}
                                onMouseDown={(e) => handlePlotMouseDown(e, 'rect')}
                                onMouseUp={handlePlotMouseUp}
                            >
                                <Square size={24} />
                            </Button>
                            {/* Star */}
                            <Button
                                className='d-flex align-items-center ms-2'
                                variant='element'
                                draggable='true'
                                onMouseMove={handlePlotMouseMove}
                                onMouseDown={(e) => handlePlotMouseDown(e, 'star')}
                                onMouseUp={handlePlotMouseUp}
                            >
                                <Star size={24} />
                            </Button>
                        </Collapsible.Content>
                    </Collapsible.Root>

                    <Collapsible.Root
                        className="CollapsibleRoot position-relative ms-2"
                        style={{ zIndex: 1000 }}
                        open={openPlants}
                        onOpenChange={handleOpenPlants}>
                        <Collapsible.Trigger className='collapsible-trigger' asChild>
                            <Button
                                className={`${openPlants ? 'active' : ''} d-flex align-items-center`}
                                variant='toolbar'
                            >
                                {openPlants ? <XLg size={24} /> : <Flower2 size={24} />}
                            </Button>
                        </Collapsible.Trigger>
                        <Collapsible.Content
                            className='d-flex flex-row mt-4 position-absolute'
                        >
                            {plants.map((plant) => {
                                const { id, name, src, color } = plant;
                                return (
                                    <Button
                                        key={id}
                                        className='d-flex align-items-center ms-2'
                                        variant='element'
                                        draggable='true'
                                        onMouseMove={handlePlantMouseMove}
                                        onMouseDown={(e) => handlePlantMouseDown(e, id)}
                                        onMouseUp={handlePlantMouseUp}
                                        onClick={() => onPlantClick(id)}
                                    >
                                        <img
                                            alt={plant.name}
                                            src={require('../assets/images/' + src)}
                                            draggable="false"
                                            style={{ height: '24px', width: '24px' }}
                                        />
                                    </Button>
                                );
                            })}
                        </Collapsible.Content>
                    </Collapsible.Root>
                </ButtonGroup>

                <Toolbar.Separator className="ToolbarSeparator" />

                <Toolbar.Separator className="ToolbarSeparator ms-auto" />

                <ButtonGroup className='d-flex d-row justify-content-center'>
                    {/* Undo */}
                    <Button
                        className={`d-flex align-items-center`}
                        variant='toolbar'
                        onClick={onUndo}
                    >
                        <ArrowCounterclockwise />
                    </Button>

                    {/* Redo */}
                    <Button
                        className={`d-flex align-items-center`}
                        variant='toolbar'
                        onClick={onRedo}
                    >
                        <ArrowClockwise />
                    </Button>
                </ButtonGroup>

            </Toolbar.Root>
        </div >

    );

}