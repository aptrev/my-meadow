import React, { useEffect, useState } from 'react';
import shelf from '../assets/images/shelf.png';
import AppContainer from '../components/AppContainer';
import {useParams } from "react-router-dom";
import { retrieveGarden } from '../utilities/FirebaseUtils';

const Indoor = () => {
  const { id } = useParams();
  const [garden, setGarden] = useState(null);

  useEffect(() => {
    if (id) {
      retrieveGarden(id)
      .then((data) => {
        setGarden(data);
      });
    }
    
  }, [id, setGarden])


  if (!garden) return <p>Loading garden...</p>;

  return (
    <AppContainer>
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
    </AppContainer>
  );
};

export default Indoor;