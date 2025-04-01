import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Navbar, Nav, Dropdown, Button, Offcanvas } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const MyMeadowCalendar = () => {
  const [view, setView] = useState("timeGridDay");
  const [showSidebar, setShowSidebar] = useState(false);
  const [notes, setNotes] = useState("Reap and gather tomatoes from Garden 1\nBuy new iris seeds\nPay neighbor to weed garden");

  return (
    <div>
      {/* Navbar */}
      <Navbar style={{ backgroundColor: "#3B6255" }} variant="dark" expand="lg" className="p-3">
      <Button variant="light" onClick={() => setShowSidebar(true)} aria-label="Open sidebar">☰</Button>
        <Dropdown className="mx-auto">
          <Dropdown.Toggle variant="light">My Garden 1</Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item>Garden 1</Dropdown.Item>
            <Dropdown.Item>Garden 2</Dropdown.Item>
            <Dropdown.Item>All Gardens</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Button variant="light" aria-label="Notifications">🔔</Button>
      </Navbar>

      {/* Sidebar */}
      <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Dashboard</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <Nav.Link href="#">Home</Nav.Link>
            <Nav.Link href="#">Profile</Nav.Link>
            <Nav.Link href="#">Calendar</Nav.Link>
            <Nav.Link href="#">Help</Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Calendar Controls */}
      <div className="text-center my-3">
        <Button style={{ backgroundColor: "#3B6255", borderColor: "#3B6255", color: "#fff" }} onClick={() => setView("dayGridDay")}>Day</Button>
        <Button style={{ backgroundColor: "#3B6255", borderColor: "#3B6255", color: "#fff" }} onClick={() => setView("timeGridThreeDay")} className="mx-2">3 Days</Button>
        <Button style={{ backgroundColor: "#3B6255", borderColor: "#3B6255", color: "#fff" }} onClick={() => setView("timeGridWeek")}>Week</Button>
        <Button style={{ backgroundColor: "#3B6255", borderColor: "#3B6255", color: "#fff" }} onClick={() => setView("dayGridMonth")} className="mx-2">Month</Button>
      </div>

      {/* Calendar */}
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

      {/* Notes Section */}
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

export default MyMeadowCalendar;
