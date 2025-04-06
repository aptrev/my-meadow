import React, { useEffect, useState } from "react";
import { Offcanvas, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ show, onClose }) => {
  const navigate = useNavigate();
  const [firstGarden, setFirstGarden] = useState(null);

  useEffect(() => {
    const gardens = JSON.parse(localStorage.getItem("gardens")) || [];
    if (gardens.length > 0) {
      setFirstGarden(gardens[0]);
    }
  }, []);

  const goToHome = () => {
    if (!firstGarden) return;
    localStorage.setItem("selectedGardenId", firstGarden.id);
    navigate(firstGarden.location === "Indoor" ? "/indoor" : "/outdoor");
  };

  return (
    <Offcanvas show={show} onHide={onClose}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Navigation</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Nav className="flex-column">
          <Nav.Link onClick={goToHome}>🏡 Home</Nav.Link>
          <Nav.Link onClick={() => navigate("/calendar")}>🗓️ Calendar</Nav.Link>
          <Nav.Link onClick={() => alert("Print coming soon!")}>🖨️ Print</Nav.Link>
          <Nav.Link onClick={() => alert("Profile coming soon!")}>👤 Profile</Nav.Link>
          <Nav.Link onClick={() => alert("Help coming soon!")}>❓ Help</Nav.Link>
        </Nav>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default Sidebar;
