import React, { useEffect, useState } from 'react';
import '../style/home.css';
import shelf from '../images/shelf.png';
import { useNavigate } from "react-router-dom";

const Indoor = () => {
  const [template, setTemplate] = useState(null);
  const navigate = useNavigate();

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
          <button id="edit-btn" onClick={() => {
              navigate("/indoor/edit");
            }}>Edit</button>
        </div>
      </header>

      {/* Shelf or Empty */}
      {template === "Shelf" && (
        <div className="shelf-wrapper">
          <img src={shelf} alt="Shelf" className="shelf-img" />
          <div className="plant-container">
            {/* TODO: place plant */}
          </div>
        </div>
      )}

      {/* Info Card (always shown) */}
      <div className="plant-info">
        <h2>🌺 Begonia</h2>
        <p>
          <strong>Begonia 'Art Hodes'</strong> is an amazing flowering plant species
          with large and beautiful flowers with orange and yellow streaked petals.
          It's an ideal choice for any garden due to its resilience and ease of care.
        </p>
        <div className="icons">
          <span>💧</span>
          <span>☀️</span>
        </div>
      </div>
    </div>
  );
};

export default Indoor;
