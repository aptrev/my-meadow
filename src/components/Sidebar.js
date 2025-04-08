import React, { useEffect, useState, useContext } from "react";
import { Offcanvas, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthProvider";  // Make sure this is the correct path

const Sidebar = ({ show, handleClickLink, onClose }) => {
  const { user } = useContext(AuthContext); // Access user from AuthContext
  const navigate = useNavigate();
  const [userIdFromStorage, setUserIdFromStorage] = useState(null);

  useEffect(() => {
    if (user) {
      setUserIdFromStorage(user.uid); // Set user ID from context
    }
  }, [user]); // Re-run when user changes

  const goToHome = () => {
    handleClickLink();
    navigate('/');
  };

  const goToCalendar = () => {
    if (userIdFromStorage) {
      navigate(`/calendar/${userIdFromStorage}`); // Use userId from context
      handleClickLink(); // Close the sidebar after navigation
    } else {
      alert("No user found to view the calendar.");
    }
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
          <Nav.Link onClick={goToCalendar} className="py-2">🗓️ Calendar</Nav.Link>
          <Nav.Link onClick={() => alert("Profile coming soon!")} className="py-2">👤 Profile</Nav.Link>
          <Nav.Link onClick={() => alert("Help coming soon!")} className="py-2">❓ Help</Nav.Link>
        </Nav>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default Sidebar;
