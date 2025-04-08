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

const plant_species = [
  {
    id: 1473,
    name: "Marigold",
    src: 'marigold.png',
    color: 'orange',
    waterFrequency: 'every 2 days'
  },
  {
    id: 324,
    name: 'Magnolia',
    src: 'magnolia.png',
    color: 'beige',
    waterFrequency: 'weekly'
  },
  {
    id: 1194,
    name: 'Begonia',
    src: 'begonia.png',
    color: 'pink',
    waterFrequency: 'every 3 days'
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
  "every 2 days": 2,
  "every 3 days": 3,
  "weekly": 7
};

const MyMeadowCalendar = () => {
  const { id } = useParams();
  const [view, setView] = useState("timeGridDay");
  const [showSidebar, setShowSidebar] = useState(false);
  const [notes, setNotes] = useState("Reap and gather tomatoes from Garden 1\nBuy new iris seeds\nPay neighbor to weed garden");
  const [garden, setGarden] = useState(null);
  const [events, setEvents] = useState([]);

  // generate watering events based on plots and plant schedule
  const generateWateringEvents = (plots) => {
    const now = new Date(); // current date
    const plantIds = plots.map(p => p.plant).filter(Boolean); // get all planted IDs
    const uniquePlantIds = [...new Set(plantIds)];

    let newEvents = [];

    uniquePlantIds.forEach(id => {
      const plant = plant_species.find(p => p.id === id);
      if (!plant || !plant.waterFrequency) return;

      const interval = frequencyMap[plant.waterFrequency];
      if (!interval) return;

      let current = new Date(now);

      for (let i = 0; i < 10; i++) {
        const date = new Date(current);
        date.setHours(8, 0, 0, 0); // 8am
        newEvents.push({
          title: `Water ${plant.name}`,
          start: date.toISOString()
        });
        current.setDate(current.getDate() + interval);
      }
    });

    return newEvents;
  };

  useEffect(() => {
    let gardens = [];
    try {
      gardens = JSON.parse(localStorage.getItem("gardens")) || [];
    } catch (e) {
      gardens = [];
    }
    const selectedId = localStorage.getItem("gardenId");
    const garden = gardens.find(g => g.id === selectedId);
    setGarden(garden);
  }, []);

  useEffect(() => {
    if (id) {
      retrieveGarden(id)
        .then((data) => {
          data.plants = plant_species;
          setGarden(data);
        });
    }
  }, [id]);

  useEffect(() => {
    if (garden?.plots) {
      const generated = generateWateringEvents(garden.plots);
      setEvents(generated);
    }
  }, [garden]);

  return (
    <div>
      <GardenNavbar onGardenChange={() => window.location.reload()} onSidebarToggle={() => setShowSidebar(true)} />
      <Sidebar show={showSidebar} onClose={() => setShowSidebar(false)} />

      <div className="text-center my-3">
        <ButtonGroup setView={setView} />
      </div>

      <div className="container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          events={events}
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
    </div>
  );
};

const ButtonGroup = ({ setView }) => (
  <>
    <button className="btn btn-success mx-1" onClick={() => setView("dayGridDay")}>Day</button>
    <button className="btn btn-success mx-1" onClick={() => setView("timeGridThreeDay")}>3 Days</button>
    <button className="btn btn-success mx-1" onClick={() => setView("timeGridWeek")}>Week</button>
    <button className="btn btn-success mx-1" onClick={() => setView("dayGridMonth")}>Month</button>
  </>
);

export default MyMeadowCalendar;