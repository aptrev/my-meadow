import React, { useState, useEffect, useRef, useCallback } from "react";

import "../style/toolbar.css";

// Bootstrap Imports
import Button from "react-bootstrap/esm/Button";
import Stack from "react-bootstrap/Stack";
import { CaretRightFill } from "react-bootstrap-icons";
import { TbChevronCompactLeft, TbChevronCompactRight } from "react-icons/tb";

import '../style/home.css';
import '../style/outdooredit.css';
import GardenSettings from "./GardenSettings";
import { ListGroup, ToggleButton } from "react-bootstrap";

export default function PlantInfo({ garden, plants, plant, onSelect, plots }) {
    const [show, setShow] = useState(true);

    const handleToggleShow = () => {
        setShow((show) ? false : true);
    }

    return (
        <div className={`${(show) ? 'expanded' : ''} plant-info-wrapper position-relative zindex-sticky`} style={{ width: 'auto' }}>
            <div
                className={`plant-info p-0 m-0 position-relative`}
                style={{ backgroundColor: 'var(--secondaryLightGreen)', height: 'calc(100svh - 75px)' }}
            >
                <div className='plant-info-content p-2 d-flex flex-column justify-content-center align-items-center'>
                    <ListGroup
                    className='plant-list w-100'>
                        {plants && plants.map((plant) => {
                            return <ListGroup.Item
                            className={`${(plant.id === plant) ? 'active' : ''} plant-list-item m-0 p-0`}
                            key={'plant-list-item' + plant.id}
                            style={{backgroundColor: 'transparent'}}>
                                <ToggleButton
                                    className='p-0 m-0 w-100'
                                    variant='list'
                                    type='checkbox'
                                    value={plant.id}
                                    checked={plant.id === plant}
                                    onChange={(e) => onSelect(plant.id)}>
                                        <CaretRightFill className='icon' />
                                        <span className='label'>{plant.id + ' | ' + plant.name}</span>
                                </ToggleButton>
                            </ListGroup.Item>
                        })}
                    </ListGroup>

                </div>
            </div>

            <Button
                className={`${(show) ? 'active' : ''} right collapse-plant-info p-0 m-0 position-absolute top-0 bottom-0`}
                variant='collapse'
                onClick={(e) => handleToggleShow()}
                style={{ zIndex: 1000, left: '-14px' }}>
                <div>
                    {(show) ? <TbChevronCompactRight stroke="white" size={24} />
                        : <TbChevronCompactLeft stroke="white" size={24} />}
                </div>
            </Button>
        </div>
    );
}