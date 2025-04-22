import React, { useEffect, useState, useContext } from "react";
import { Plus, HouseDoorFill, Calendar3, PersonFill, Question } from "react-bootstrap-icons";
import { Offcanvas, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthProvider";

import './Sidebar.css'

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

  const goToProfile = () => {
    handleClickLink();
    navigate(`/profile/${user.uid}`);
  };

  const goToCreate = () => {
    handleClickLink();
    navigate('/create');
  };

  const goToCalendar = () => {
    handleClickLink();
    navigate('/calendars');
  };

  return (
    <Offcanvas
      className='sidebar'
      show={show}
      onHide={onClose}
      placement="start"
      backdrop={true}
      scroll={true}
      style={{ width: "250px" }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Navigation</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Nav className="flex-column">
          <Nav.Link onClick={goToCreate} className="py-2"><Plus size={24} /><span className='ms-2'>Add Garden</span></Nav.Link>
          <Nav.Link onClick={goToHome} className="py-2"><HouseDoorFill size={24} /><span className='ms-2'>Home</span></Nav.Link>
          <Nav.Link onClick={goToCalendar} className="py-2"><Calendar3 size={24} /><span className='ms-2'>Calendar</span></Nav.Link>
          <Nav.Link onClick={goToProfile} className="py-2"><PersonFill size={24} /><span className='ms-2'>Profile</span></Nav.Link>
          <Nav.Link onClick={() => alert("Help coming soon!")} className="py-2"><Question size={24} /><span className='ms-2'>Help</span></Nav.Link>
        </Nav>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default Sidebar;
