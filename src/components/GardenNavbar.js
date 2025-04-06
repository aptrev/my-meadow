import React, { useEffect, useState } from "react";
import { Navbar, Dropdown, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const GardenNavbar = ({ onGardenChange, onSidebarToggle, isEditing, onSave }) => {
  const [gardens, setGardens] = useState([]);
  const [selectedGardenId, setSelectedGardenId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedGardens = JSON.parse(localStorage.getItem("gardens")) || [];
    const selectedId = JSON.parse(localStorage.getItem("selectedGardenId"));
    setGardens(storedGardens);
    setSelectedGardenId(selectedId);
  }, []);

  const handleGardenSwitch = (gardenId) => {
    localStorage.setItem("selectedGardenId", gardenId);
    setSelectedGardenId(gardenId);
    if (onGardenChange) onGardenChange(gardenId);
  };

  const handleEdit = () => {
    const selectedGarden = gardens.find((g) => g.id === selectedGardenId);
    if (selectedGarden?.location === "Indoor") {
      navigate("/indoor/edit");
    } else if (selectedGarden?.location === "Outdoor") {
      navigate("/outdoor/edit");
    } else {
      alert("No garden selected to edit.");
    }
  };

  const selectedGarden = gardens.find((g) => g.id === selectedGardenId);

  return (
    <Navbar style={{ backgroundColor: "#3B6255" }} variant="dark" expand="lg" className="p-3 justify-content-between">
      {/* Sidebar button */}
      <Button
        variant="light"
        onClick={onSidebarToggle || (() => alert("Sidebar coming soon!"))}
        aria-label="Open sidebar"
      >
        ☰
      </Button>

      {/* Garden selector dropdown */}
      <Dropdown className="mx-auto">
        <Dropdown.Toggle variant="light">
          {selectedGarden ? selectedGarden.name : "Select Garden"}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {gardens.map((garden) => (
            <Dropdown.Item key={garden.id} onClick={() => handleGardenSwitch(garden.id)}>
              {garden.name}
            </Dropdown.Item>
          ))}
          <Dropdown.Divider />
          <Dropdown.Item onClick={() => alert("All Gardens view coming soon!")}>
            All Gardens
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {/* Right-side buttons: Edit + Notifications */}
      <div className="d-flex align-items-center gap-2">
        {/* <Button variant="light" aria-label="Notifications">🔔</Button> */}
        <Button variant="light" onClick={isEditing ? onSave : handleEdit}>{(isEditing) ? 'Save' : 'Edit'}</Button>
      </div>
    </Navbar>
  );
};

export default GardenNavbar;