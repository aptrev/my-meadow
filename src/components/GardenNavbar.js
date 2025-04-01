import React, { useEffect, useState } from "react";
import { Navbar, Dropdown, Button } from "react-bootstrap";

const GardenNavbar = ({ onGardenChange, onSidebarToggle }) => {
  const [gardens, setGardens] = useState([]);
  const [selectedGardenId, setSelectedGardenId] = useState(null);

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

  const selectedGarden = gardens.find((g) => g.id === selectedGardenId);

  return (
    <Navbar style={{ backgroundColor: "#3B6255" }} variant="dark" expand="lg" className="p-3">
      <Button
        variant="light"
        onClick={onSidebarToggle || (() => alert("Sidebar coming soon!"))}
        aria-label="Open sidebar"
      >
        ☰
      </Button>

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

      <Button variant="light" aria-label="Notifications">
        🔔
      </Button>
    </Navbar>
  );
};

export default GardenNavbar;