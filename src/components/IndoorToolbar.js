import { useState, useEffect, useCallback, useRef } from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Button from 'react-bootstrap/Button';
import { Toolbar } from "radix-ui";
import { Collapsible } from "radix-ui";
import { Flower2, XLg, CircleSquare, ArrowCounterclockwise, ArrowClockwise, Trash3 } from 'react-bootstrap-icons';
import { ReactSVG } from 'react-svg';
import "../style/toolbar.css";

export default function IndoorToolbar({ onUndo, onRedo, onDelete, toolbarButtons, activeTool, setActiveTool }) {
    const [open, setOpen] = useState(null);

    const handleOnOpenChange = (index) => {
        setOpen((prevOpen) => (prevOpen === index ? null : index));
    };

    const handleToggle = (toolKey) => {
        setActiveTool((prev) => (prev === toolKey ? null : toolKey));
    };

    return (
        <div className='d-flex f-row'>
            <Toolbar.Root className="ToolbarRoot position-relative">
                <ButtonGroup className='d-flex d-row justify-content-center'>
                    {toolbarButtons.map((button, index) => {
                        const isOpen = open === index;
                        const isActive = activeTool === button.value;
                        const Icon = isActive ? button.iconActive : button.iconDisabled;

                        return (
                            <Collapsible.Root
                                key={button.id}
                                open={isOpen}
                                onOpenChange={() => handleOnOpenChange(index)}
                            >
                                <Collapsible.Trigger asChild>
                                    <Button
                                        className={`d-flex align-items-center ${isOpen ? 'active' : ''}`}
                                        variant='toolbar'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (button.type === 'toggle') {
                                                handleToggle(button.value);
                                            }
                                        }}
                                    >
                                        {Icon}
                                    </Button>
                                </Collapsible.Trigger>

                                <Collapsible.Content className='d-flex flex-row mt-4 position-absolute gap-3'>
                                    {button.options.map((option) => (
                                        <Button
                                            key={option.id}
                                            id={option.id}
                                            className='d-flex shadow-sm justify-content-center align-items-center'
                                            variant='element'
                                            draggable={button.type === 'radio'}
                                            onMouseDown={(e) => button.onDragStart?.(e)}
                                            onMouseMove={(e) => button.onDrag?.(e)}
                                            onMouseUp={(e) => button.onDragEnd?.(e)}
                                            onClick={() => button.onSelect?.(option.value)}
                                        >
                                            {option.format === 'svg' ? (
                                                <ReactSVG
                                                    src={option.src}
                                                    beforeInjection={(svg) => {
                                                        svg.classList.add('toolbar-element-icon');
                                                        svg.setAttribute('width', 20);
                                                        svg.setAttribute('height', 20);
                                                    }}
                                                    wrapper="div"
                                                />
                                            ) : (
                                                <img
                                                    alt={option.name}
                                                    src={option.src}
                                                    draggable="false"
                                                    style={{ height: '24px', width: '24px' }}
                                                />
                                            )}
                                        </Button>
                                    ))}
                                </Collapsible.Content>
                            </Collapsible.Root>
                        );
                    })}
                </ButtonGroup>

                <Toolbar.Separator className="ToolbarSeparator" />
                <Toolbar.Separator className="ToolbarSeparator ms-auto" />

                <ButtonGroup className='d-flex d-row justify-content-center'>
                    <Button className='d-flex align-items-center' variant='toolbar' onClick={onUndo}>
                        <ArrowCounterclockwise />
                    </Button>
                    <Button className='d-flex align-items-center' variant='toolbar' onClick={onRedo}>
                        <ArrowClockwise />
                    </Button>
                </ButtonGroup>

                <Toolbar.Separator className="ToolbarSeparator" />

                <Button className='d-flex align-items-center' variant='outline-danger' onClick={onDelete}>
                    <Trash3 />
                </Button>
            </Toolbar.Root>
        </div>
    );
}
