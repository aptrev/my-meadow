import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import { useState, useEffect, useCallback } from "react";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";

const nameRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

function validName(name) {
    return (typeof name === 'string') && nameRegex.test(name);
}

function validDimension(dimensions) {
    if (!dimensions) {
        return false;
    }
    if (isNaN(Number(dimensions.width)) || dimensions.width <= 0 || dimensions.width > 100) {
        return false;
    }
    if (isNaN(Number(dimensions.height)) || dimensions.height <= 0 || dimensions.height > 100) {
        return false;
    }
    return true;
}

export default function GardenSettings({ garden, onUpdateGarden, onPrint }) {
    const [editing, setEditing] = useState(false);
    const [valid, setValid] = useState(true);
    const [name, setName] = useState('');
    const [background, setBackground] = useState(null);
    const [dimensions, setDimensions] = useState(null);
    const [units, setUnits] = useState('ft');

    useEffect(() => {
        if (garden) {
            setName(garden.name);
            setBackground(garden.background);
            setDimensions({
                width: garden.width,
                height: garden.height,
            });
            setUnits(garden.dimensions_units);
        }
    }, [garden])

    const dimensionsEqual = useCallback(() => {
        console.log(dimensions.width + ' ' + garden.width);
        console.log(dimensions.height + ' ' + garden.height);
        return dimensions.width == garden.width && dimensions.height == garden.height;
    }, [dimensions, garden.width, garden.height])

    const handleOnChange = async (e) => {
        if (name === garden.name &&
            background === garden.background &&
            dimensionsEqual() &&
            units === garden.dimensions_units) {
            setEditing(false);
        }
        else {
            setEditing(true);
        }
    }

    useEffect(() => {
        if (garden && name !== null && background !== null && dimensions !== null && units !== null) {
            setEditing(
                name !== garden.name ||
                background !== garden.background ||
                !dimensionsEqual() ||
                units !== garden.dimensions_units);
        }

    }, [name, background, dimensions, dimensionsEqual, units])

    const handleChangeName = (e, value) => {
        setValid(validName(value));
        setName(value);
    }

    const handleChangeBackground = (e, value) => {
        setBackground(value);
    }

    const handleChangeDimensions = (e, value) => {
        setValid(validDimension(value));
        setDimensions(value);
    }

    const handleChangeUnits = (e, value) => {
        setUnits(value);
    }

    const handleClear = (e) => {
        setName(garden.name);
        setBackground(garden.background);
        setDimensions({
            width: garden.width,
            height: garden.height
        });
        setEditing(false);
        setValid(true);
    }

    const handleSave = (e) => {
        const newGarden = {
            ...garden,
            name: name,
            background: background,
            width: dimensions.width,
            height: dimensions.height,
            stage: {
                width: dimensions.width * 100,
                height: dimensions.height * 100,
            },
            dimensions_units: units,
        };
        setEditing(false);
        onUpdateGarden(newGarden);
    }

    return (
        <>
            {garden &&
                <div className=''>
                    {/* Edit Garden Name */}
                    <Form.Group
                        className='garden-settings-input w-100'>
                        <Form.Label id="gs-name">Name</Form.Label>
                        <Form.Control
                            placeholder={name}
                            aria-label="Name"
                            value={name}
                            onChange={(e) => handleChangeName(e, e.target.value)}
                            onFocus={e => e.target.select()}
                        />
                    </Form.Group >

                    {/* Edit Garden Background Color */}
                    <Form.Group
                        className='garden-settings-input w-100 mt-3'>
                        <Form.Label id="gs-bg">Background</Form.Label>
                        <div className='d-flex align-items-center'>
                            <Form.Control
                                type='color'
                                aria-label="Background"
                                value={background ? background : garden.background}
                                onChange={(e) => handleChangeBackground(e, e.target.value)}
                            />
                            {(background && background !== garden.background) &&
                                <Button
                                    className='ms-2 p-0'
                                    aria-label="Reset Background"
                                    variant='link'
                                    onClick={(e) => handleChangeBackground(e, garden.background)}
                                    style={{ textDecoration: 'none' }}
                                >
                                    undo
                                </Button>
                            }
                        </div>
                    </Form.Group>

                    {/* Edit Garden Dimensions */}
                    <Form.Group
                        className='garden-settings-input w-100 mt-3'>
                        <Form.Label id="gs-dimesions">Dimensions</Form.Label>
                        <InputGroup>
                            <Form.Control
                                aria-label="Width"
                                placeholder={dimensions ? dimensions.width : garden.width}
                                value={dimensions ? dimensions.width : garden.width}
                                onChange={(e) => handleChangeDimensions(e, {
                                    width: e.target.value,
                                    height: garden.height,
                                })}
                                onFocus={e => e.target.select()}
                            />
                            <Form.Control
                                aria-label="Height"
                                placeholder={dimensions ? dimensions.height : garden.height}
                                value={dimensions ? dimensions.height : garden.height}
                                onChange={(e) => handleChangeDimensions(e, {
                                    width: garden.width,
                                    height: e.target.value,
                                })}
                                onFocus={e => e.target.select()}
                            />
                            <DropdownButton
                                variant="outline-secondary"
                                title={units}
                                id="input-group-dropdown-2"
                                align="end"
                            >
                                <Dropdown.Item
                                    className='w-100'
                                    as='button'
                                    onClick={(e) => handleChangeUnits(e, 'ft')}>ft</Dropdown.Item>
                                <Dropdown.Item
                                    as='button'
                                    onClick={(e) => handleChangeUnits(e, 'm')}>m</Dropdown.Item>
                            </DropdownButton>
                        </InputGroup>
                    </Form.Group >

                    {/* Clear and Save Settings Buttons */}
                    {editing &&
                        <div className='w-100 d-flex justify-content-center mt-2'>
                            <Button
                                variant='secondary'
                                onClick={handleClear}>
                                Clear
                            </Button>
                            {valid ?
                                <Button
                                    variant='bar'
                                    className='ms-1'
                                    onClick={handleSave}>
                                    Save
                                </Button> :
                                <Button
                                    variant='bar'
                                    className='ms-1'
                                    onClick={handleSave}
                                    disabled>
                                    Save
                                </Button>
                            }

                        </div>
                    }

                    {/* Not valid inputs warning */}
                    {(editing && !valid) &&
                        <div className='w-100 d-flex justify-content-center mt-2'>
                            <p style={{ fontSize: '0.75em', color: 'red' }}>Please enter valid settings</p>
                        </div>
                    }
                    <div className='w-100 d-flex justify-content-center mt-2'>
                        <p style={{ fontSize: '0.75em' }}>Changes may require refresh</p>
                    </div>
                </div>
            }
        </>
    );
}