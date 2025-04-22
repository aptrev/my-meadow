import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "react-bootstrap";
import { useParams } from "react-router-dom";

import GardenNavbar from "../components/GardenNavbar";
import Sidebar from "../components/Sidebar";
import { retrieveGarden } from '../utilities/FirebaseUtils';
import AppContainer from "../components/AppContainer";

const plant_species = [
  {
    id: 1473,
    name: "Marigold",
    src: 'marigold.png',
    color: 'orange',
    waterFrequency: 'every 2 days'
  },
  {
    id: 6791,
    name: 'Rose',
    src: 'rose.png',
    color: 'red',
    waterFrequency: 'every 2 days'
  }
];

const frequencyMap = {
  "daily": 1,
  "every 2 days": 2,
  "every 3 days": 3,
  "twice a week": 3,
  "weekly": 7,
  "biweekly": 14
};

const MyMeadowCalendar = () => {
  const { id } = useParams();
  const [view, setView] = useState("timeGridDay");
  const [showSidebar, setShowSidebar] = useState(false);
  const [notes, setNotes] = useState("Reap and gather tomatoes from Garden \nBuy new iris seeds\nPay neighbor to weed garden");
  const [garden, setGarden] = useState(null);
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    if (id) {
      retrieveGarden(id)
        .then((data) => {
          // Ensure plants data is correctly merged with existing data from Firebase
          // data.plants = plant_species;
          setGarden(data);
        })
        .catch((error) => {
          console.error("Error fetching garden:", error);
        });
    }
  }, [id]);
  
  useEffect(() => {
    // Check that garden and garden.plots are available
    
    if (garden && garden.plots) {
      const generated = generateWateringEvents(garden.plots);
      setEvents(generated);
    }
  }, [garden]);  // Re-run the effect only when garden changes
  
  const generateWateringEvents = (plots) => {
    console.log("GARDEN DATA: ", garden);
    console.log("ID: ", id);
  
    const now = new Date();
    if (!garden) return []; // Avoid error if garden is not loaded yet
  
    let gardenPlants = [];
  
    // Normalize access to plants/flowers
    if (garden.location === "outdoor") {
      gardenPlants = garden.plants || [];
    } else if (garden.location === "indoor") {
      gardenPlants = (garden.pots || []).map(pot => pot.flower).filter(Boolean); // Get each flower in a pot
    }
  
    console.log("Normalized Plants: ", gardenPlants);
  
    const newEvents = [];
  
    gardenPlants.forEach(plant => {
      const interval = frequencyMap[plant.waterFrequency] || 7; // Default to 7 days if undefined
      if (!interval) return;
  
      let current = new Date(now);
  
      for (let i = 0; i < 10; i++) {
        const date = new Date(current);
        date.setHours(10, 0, 0, 0);  // Set watering time to 10am
        newEvents.push({
          title: `Water ${plant.name}`,
          start: date.toISOString()
        });
        current.setDate(current.getDate() + interval);
      }
    });
  
    return newEvents;
  };
  

  return (
    <AppContainer>

      <div className="text-center my-3">
        <h3 className="mb-2" 
                style={{ 
                  fontFamily: '"Lucida Handwriting", "Cursive", sans-serif', 
                  fontSize: '3rem'
                }}>{garden?.name ? `${garden.name}'s Calendar` : "Loading garden..."}</h3>
      </div>

      <div className="container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
        />
      </div>

      <div className="container my-4">
        <h3>Notes ✎</h3>
        <textarea
          className="form-control"
          rows="4"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </AppContainer>
  );
};

export default MyMeadowCalendar;