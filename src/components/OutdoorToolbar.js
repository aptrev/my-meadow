import { useState, useEffect, useCallback, useRef } from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton'
import Button from 'react-bootstrap/Button'
import { Toolbar } from "radix-ui";
import { Collapsible } from "radix-ui";
import { PlusCircle, Flower2, XLg, Circle, Square, Star, ArrowCounterclockwise, ArrowClockwise, Trash3 } from 'react-bootstrap-icons';
import Overlay from 'react-bootstrap/Overlay';
import { ReactSVG } from 'react-svg'
import "../style/toolbar.css";

export default function OutdoorToolbar({ onUndo, onRedo, onDelete, toolbarButtons }) {
    const [position, setPosition] = useState({
        x: 0,
        y: 0,
    });

    const [open, setOpen] = useState(null);
    const [dragging, setDragging] = useState(null);

    function getPos(e) {
        const header = document.getElementById('siteHeader');
        const toolbarButtun = document.querySelector('.btn-toolbar');
        const elementButton = document.querySelector('.btn-element');
        return {
            x: e.pageX - toolbarButtun.offsetWidth,
            y: e.pageY - header.offsetHeight - toolbarButtun.offsetHeight,
        }
    }

    const handleOnOpenChange = (value) => {
        if (value === open) {
            setOpen(null);
        } else {
            setOpen(value);
        }
    }

    function usePrevious(value) {
        const ref = useRef()
        useEffect(() => {
            ref.current = value
        })
        return ref.current
    }

    const handleMouseMove = useCallback(
        (e) => {
            e.preventDefault();
            setPosition(getPos(e));
            toolbarButtons.forEach(({ onDrag }, i) => {
                if (i === open) {
                    onDrag(e);
                }
            })
        },
        [open, toolbarButtons]
    )

    const handleMouseUp = useCallback(
        (e) => {
            e.preventDefault();
            toolbarButtons.forEach(({ onDragEnd }, i) => {
                if (i === open) {
                    onDragEnd(e);
                    setDragging(null);
                }
            })
            document.removeEventListener('mousemove', handleMouseMove);
        },
        [open, toolbarButtons, handleMouseMove]
    )

    const handleMouseDown = useCallback(
        (e, value, index) => {
            e.preventDefault();
            toolbarButtons.forEach(({ onDragStart, onSelect }, i) => {
                if (i === open) {
                    setDragging(index);
                    onDragStart(e);
                    onSelect(value);
                }
            })

            document.addEventListener('mousemove', handleMouseMove)
        },
        [open, toolbarButtons, handleMouseMove]
    )

    const prevMouseMove = usePrevious(handleMouseMove)

    useEffect(
        () => {
            document.removeEventListener('mousemove', prevMouseMove);
            if (dragging !== null) {
                document.addEventListener('mousemove', handleMouseMove)
            }
        },
        [prevMouseMove, handleMouseMove, dragging]
    )

    useEffect(
        () => {
            if (dragging !== null) {
                document.addEventListener('mouseup', handleMouseUp)
            }
            return () => document.removeEventListener('mouseup', handleMouseUp)
        },
        [dragging, handleMouseUp]
    )

    const getShape = () => {
        if (open !== null && dragging !== null) {
            const tool = toolbarButtons[open];
            const option = tool.options[dragging];

            return <img
                alt={option.name}
                src={option.src}
                style={{
                    display: (option) ? 'block' : 'none',
                    height: 64,
                    width: 64,
                    position: 'absolute',
                    left: position.x,
                    top: position.y,
                    cursor: 'grab',
                    color: 'var(--primaryDarkGreen)',
                    zIndex: 1001,
                    filter: 'drop-shadow(0 0 0.25rem black)',
                }}
            />
        }
    }

    return (
        <div className='d-flex f-row'>
            {getShape()}

            <Toolbar.Root className="ToolbarRoot position-relative">
                <ButtonGroup className='d-flex d-row justify-content-center'>
                    {toolbarButtons.map((button, index) => {
                        const buttonOpen = open === index;
                        return <Collapsible.Root
                            key={button.id}
                            id={button.id}
                            className="CollapsibleRoot position-relative"
                            style={{ zIndex: 1000 }}
                            open={buttonOpen}
                            onOpenChange={(e) => handleOnOpenChange(index)}>
                            <Collapsible.Trigger className='collapsible-trigger' asChild>
                                <Button
                                    className={`${buttonOpen ? 'active' : ''} d-flex align-items-center`}
                                    variant='toolbar'
                                >
                                    {buttonOpen ? button.iconActive : button.iconDisabled}
                                </Button>
                            </Collapsible.Trigger>
                            <Collapsible.Content
                                className='d-flex flex-row mt-4 position-absolute gap-3'
                            >
                                {button.options.map((option, index) => {
                                    return <Button
                                        key={option.id}
                                        id={option.id}
                                        className='d-flex shadow-sm justify-content-center align-items-center'
                                        variant='element'
                                        draggable='true'
                                        onMouseMove={handleMouseMove}
                                        onMouseDown={(e) => handleMouseDown(e, option.value, index)}
                                        onMouseUp={handleMouseUp}
                                    >
                                        {(option.format === 'svg') ?
                                            <ReactSVG
                                                src={option.src}
                                                beforeInjection={(svg) => {
                                                    svg.classList.add('toolbar-element-icon');
                                                    svg.setAttribute('width', 20);
                                                    svg.setAttribute('height', 20);
                                                }}
                                                wrapper="div"
                                            />
                                            : <img
                                                alt={option.name}
                                                src={option.src}
                                                draggable="false"
                                                style={{ height: '24px', width: '24px' }} />
                                        }
                                    </Button>
                                })}

                            </Collapsible.Content>
                        </Collapsible.Root>
                    })}
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

                <Toolbar.Separator className="ToolbarSeparator" />

                {/* Trash */}
                <Button
                    className={`d-flex align-items-center`}
                    variant='outline-danger'
                    onClick={onDelete}
                >
                    <Trash3 />
                </Button>

            </Toolbar.Root>
        </div >

    );

}