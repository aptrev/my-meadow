import React, { useEffect, useState } from "react";
import { Offcanvas, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ show, handleClickLink, onClose }) => {
  const navigate = useNavigate();
  const [firstGarden, setFirstGarden] = useState(null);

  // useEffect(() => {
  //   const gardens = JSON.parse(localStorage.getItem("gardens")) || [];
  //   if (gardens.length > 0) {
  //     setFirstGarden(gardens[0]);
  //   }
  // }, []);

  const goToHome = () => {
    handleClickLink();
    navigate('/');
  };

  return (
    <Offcanvas
      show={show}
      onHide={onClose}
      placement="start"
      backdrop={false}
      scroll={true}
      style={{ width: "250px" }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Navigation</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Nav className="flex-column">
          <Nav.Link onClick={() => navigate("/")} className="py-2">➕ Add Garden</Nav.Link>
          <Nav.Link onClick={goToHome} className="py-2">🏡 Home</Nav.Link>
          <Nav.Link onClick={() => navigate("/calendar")} className="py-2">🗓️ Calendar</Nav.Link>
          <Nav.Link onClick={() => alert("Profile coming soon!")} className="py-2">👤 Profile</Nav.Link>
          <Nav.Link onClick={() => alert("Help coming soon!")} className="py-2">❓ Help</Nav.Link>
        </Nav>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default Sidebar;