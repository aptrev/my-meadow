import React from 'react';
import '../style/home.css';
import shelf from '../images/shelf.png'; 

const Home = () => {
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

      {/* Shelf image with plant on it */}
      <div className="shelf-wrapper">
        <img src={shelf} alt="Shelf" className="shelf-img" />
        <div className="plant-container">
          {/* TODO: place plant */}
        </div>
      </div>

      {/* Info Card */}
      <div className="plant-info">
        {/* TODO: replace to info of plant that is placed */}
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

export default Home;
