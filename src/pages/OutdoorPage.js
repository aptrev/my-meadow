import React, { useEffect, useState } from 'react';
import cobblestoneImage from '../images/cobblestone.png';
import '../style/home.css';

const Outdoor = () => {
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    const selectedTemplate = localStorage.getItem("selectedTemplate");
    setTemplate(selectedTemplate);
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header>
        <div className="top-bar">
          <select>
            <option>My Garden 1</option>
          </select>
          <button id="edit-btn" onClick={() => alert('Edit feature coming soon!')}>Edit</button>
        </div>
      </header>

      {/* Template view */}
      {template === "Cobblestone" && (
        <div className="template-wrapper">
          <img src={cobblestoneImage} alt="Cobblestone Layout" className="template-img" />
        </div>
      )}

      {/* Plant info stays the same */}
      <div className="plant-info">
        <h2>🌿 Lavender</h2>
        <p>
          <strong>Lavandula angustifolia</strong> is a fragrant perennial herb, loved for its soothing scent and pollinator-friendly blooms.
          Great for any outdoor garden!
        </p>
        <div className="icons">
          <span>💧</span>
          <span>☀️</span>
        </div>
      </div>
    </div>
  );
};

export default Outdoor;
