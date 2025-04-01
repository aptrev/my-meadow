import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import GardenNavbar from "../components/GardenNavbar";
import Sidebar from "../components/Sidebar";

const MyMeadowCalendar = () => {
  const [view, setView] = useState("timeGridDay");
  const [showSidebar, setShowSidebar] = useState(false);
  const [notes, setNotes] = useState("Reap and gather tomatoes from Garden 1\nBuy new iris seeds\nPay neighbor to weed garden");
  const [selectedGarden, setSelectedGarden] = useState(null);

  useEffect(() => {
    const gardens = JSON.parse(localStorage.getItem("gardens")) || [];
    const selectedId = JSON.parse(localStorage.getItem("selectedGardenId"));
    const garden = gardens.find(g => g.id === selectedId);
    setSelectedGarden(garden);
  }, []);

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
          events={[
            { title: "Water", start: "2024-03-10T12:00:00" },
            { title: "Weed Garden 1", start: "2024-03-10T11:00:00" }
          ]}
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
