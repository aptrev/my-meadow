import React, { useEffect, useState } from 'react';
import GardenNavbar from '../components/GardenNavbar';
import Sidebar from '../components/Sidebar';
import shelf from '../images/shelf.png';
import '../style/home.css';

const Indoor = () => {
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

  if (!garden) return <p>Loading garden...</p>;

  return (
    <div className="app">
      <GardenNavbar onGardenChange={loadSelectedGarden} onSidebarToggle={() => setShowSidebar(true)} />
      <Sidebar show={showSidebar} onClose={() => setShowSidebar(false)} />

      {garden.template === "Shelf" && (
        <div className="shelf-wrapper">
          <img src={shelf} alt="Shelf" className="shelf-img" />
          <div className="plant-container">
            {garden.plants?.map((plant, idx) => (
              <div key={idx} style={{ position: 'absolute', left: plant.x, top: plant.y }}>
                🪴
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="plant-info">
        <h2>🌺 Begonia</h2>
        <p><strong>Begonia 'Art Hodes'</strong> is a resilient, easy-care flowering plant perfect for indoor gardens.</p>
        <div className="icons">
          <span>💧</span>
          <span>☀️</span>
        </div>
      </div>
    </div>
  );
};

export default Indoor;