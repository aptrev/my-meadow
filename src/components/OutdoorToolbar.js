import { useState } from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton'
import Button from 'react-bootstrap/Button'
import { Toolbar } from "radix-ui";
import { ArrowCounterclockwise, ArrowClockwise, Trash3 } from 'react-bootstrap-icons';
import "../style/toolbar.css";
import "../style/home.css";

export default function OutdoorToolbar({ onUndo, onRedo, onDelete, stageButtons, checked,
    elementButtons, selectedElement, sliderValue, onSliderChange }) {
    const [selected, setSelected] = useState(Array.from({length: stageButtons.length}, () => false));

    const handleSelect = (index) => {
        const newSelected = [...selected];
        newSelected[index] = (selected[index]) ? false : true;
        setSelected(newSelected);
        stageButtons[index].onSelect(newSelected[index]);
    }

    return (
        <div className='d-flex flex-row align-items-center justify-content-center position-absolute w-100'>
            <Toolbar.Root className="ToolbarRoot position-relative">
                <div className='d-flex d-row justify-content-center align-items-center gap-1'>
                    {stageButtons.map((button, index) => {
                        return <ToggleButton
                            className={`${(checked[index] ? 'active' : '')}`}
                            key={button.id}
                            id={button.id}
                            type='checkbox'
                            variant='toggle'
                            name={button.name}
                            title={button.name}
                            checked={checked[index]}
                            onChange={(e) => handleSelect(index)}
                        >{button.label}</ToggleButton>
                    })}
                </div>

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