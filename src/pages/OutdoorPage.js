import React, { useEffect, useState } from 'react';
import GardenNavbar from '../components/GardenNavbar';
import Sidebar from '../components/Sidebar';
import cobblestoneImage from '../images/cobblestone.png';
import { useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import '../style/home.css';

const Outdoor = () => {
  const [garden, setGarden] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const loadSelectedGarden = () => {
    const gardens = JSON.parse(localStorage.getItem("gardens")) || [];
    const selectedId = JSON.parse(localStorage.getItem("selectedGardenId"));
    const selected = gardens.find(g => g.id === selectedId);
    setGarden(selected);
  };

  useEffect(() => {
    loadSelectedGarden();
  }, []);

  const navigate = useNavigate();

  if (!garden) return <p>Loading garden...</p>;

  return (
    <div className="app">
      <GardenNavbar onGardenChange={loadSelectedGarden} onSidebarToggle={() => setShowSidebar(true)} />
      <Sidebar show={showSidebar} onClose={() => setShowSidebar(false)} />

      {garden.template === "Cobblestone" && (
        <div className="template-wrapper">
          <img src={cobblestoneImage} alt="Cobblestone Layout" className="template-img" />
          <div className="plant-container">
            {garden.plants?.map((plant, idx) => (
              <div key={idx} style={{ position: 'absolute', left: plant.x, top: plant.y }}>
                🌿
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="plant-info">
        <h2>🌿 Lavender</h2>
        <p><strong>Lavandula angustifolia</strong> is a fragrant perennial herb, loved for its scent and pollinator-friendly blooms.</p>
        <div className="icons">
          <span>💧</span>
          <span>☀️</span>
        </div>
      </div>
    </div>
  );
};

export default Outdoor;