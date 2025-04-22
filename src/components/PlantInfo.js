import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { ListGroup, ToggleButton, Button } from "react-bootstrap";
import { CaretRightFill } from "react-bootstrap-icons";
import { TbChevronCompactLeft, TbChevronCompactRight } from "react-icons/tb";
import plantsData from '../data/plants.json';

import "../style/toolbar.css";
import '../style/home.css';
import '../style/outdooredit.css';
import { CollapseButton } from "./Buttons/Buttons";

export default function PlantInfo({ garden, plants, plant, onSelect, plots }) {
    const [show, setShow] = useState(true);
    const [selectedPlantDetails, setSelectedPlantDetails] = useState(null);
    const navigate = useNavigate();

    const handleToggleShow = () => {
        setShow((prev) => !prev);
    }

    const goToCalendars = () => {
        navigate('/calendars');
    }

    useEffect(() => {
        if (plant) {
            // Match by plant name or ID from your props
            const matchedPlant = plantsData.find(p => p.name === plant.name);
            setSelectedPlantDetails(matchedPlant);
        } else {
            setSelectedPlantDetails(null);
        }
    }, [plant]);

    return (
        <div className={`${show ? 'expanded' : ''} plant-info-wrapper position-relative zindex-sticky`} style={{ width: 'auto' }}>
            <div
                className="plant-info p-0 m-0 position-relative"
                style={{ backgroundColor: 'var(--secondaryLightGreen)', height: 'calc(100svh - 75px)' }}
            >
                <div className='plant-info-content p-4' style={{ overflowY: 'auto', maxHeight: '100%' }}>
                    <ListGroup className='plant-list w-100'>
                        {plants && plants.map((p) => (
                            <ListGroup.Item
                                className={`${plant?.id === p.id ? 'active' : ''} plant-list-item m-0 p-0`}
                                key={`plant-list-item-${p.id}`}
                                style={{ backgroundColor: 'transparent' }}
                            >
                                <ToggleButton
                                    className='p-0 m-0 w-100'
                                    variant='list'
                                    type='radio'
                                    value={p.id}
                                    checked={plant?.id === p.id}
                                    onClick={() => {
                                        console.log("Clicked on:", p); // ✅ Debug log
                                        onSelect(p); // pass the full plant object
                                    }}
                                >
                                    <CaretRightFill className='icon' />
                                    <span className='label'>{p.id + ' | ' + p.name}</span>
                                </ToggleButton>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                    {/* Selected plant details */}
                    {selectedPlantDetails && (
                        <div className="plant-details mt-3 w-100 text-start px-2">
                            <h5>{selectedPlantDetails.name}</h5>
                            <img
                                src={require(`../assets/images/plants/${selectedPlantDetails.image}`)}
                                alt={selectedPlantDetails.name}
                                className="plant-image mb-2"
                                style={{ width: '100%', borderRadius: '8px' }}
                            />
                            <p><strong>Type:</strong> {selectedPlantDetails.type}</p>
                            <p><strong>Watering:</strong> {selectedPlantDetails.watering}</p>
                            <p><strong>Light:</strong> {selectedPlantDetails.light_requirement}</p>
                            <p><strong>Temp:</strong> {selectedPlantDetails.temperature_range}</p>
                            <p><strong>Soil:</strong> {selectedPlantDetails.soil_type}</p>
                            <p><strong>Height:</strong> {selectedPlantDetails.height}</p>
                            <p><strong>Care Tips:</strong> {selectedPlantDetails.care_tips}</p>
                            <p><strong>Pollinator Friendly:</strong> {selectedPlantDetails.pollinator_friendly ? 'Yes' : 'No'}</p>
                            <p><strong>Companions:</strong> {selectedPlantDetails.companion_plants?.join(', ')}</p>
                        </div>
                    )}

                    <Button
                        className="mt-3"
                        variant="upcoming"
                        onClick={goToCalendars}
                    >
                        Upcoming Tasks
                    </Button>
                </div>
            </div>

            <Button
                className={`${show ? 'active' : ''} right collapse-plant-info p-0 m-0 position-absolute top-0 bottom-0`}
                variant='collapse'
                onClick={handleToggleShow}
                style={{ zIndex: 1000, left: '-20px' }}
            >
                <div>
                    {show
                        ? <TbChevronCompactRight stroke="white" size={24} />
                        : <TbChevronCompactLeft stroke="white" size={24} />}
                </div>
            </Button>
        </div>
    );
}
