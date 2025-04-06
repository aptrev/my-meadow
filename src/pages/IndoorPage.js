import React, { useEffect, useState } from 'react';
import GardenNavbar from '../components/GardenNavbar';
import Sidebar from '../components/Sidebar';
import shelf from '../assets/images/shelf.png';
import AppContainer from '../components/AppContainer';
import { collection, addDoc, updateDoc, doc, getDoc, arrayUnion } from "firebase/firestore";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import db from '../firebase/FirebaseDB'
import { AuthContext } from "../components/AuthProvider";

const Indoor = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const [garden, setGarden] = useState(null);

  const navigate = useNavigate();

  const fetchData = async (gardenId) => {
    if (state && state.garden && state.garden.id === id) {
      console.log(`State: ${state.garden.name}`);
      return state.garden;
    }
    try {
      const gardenRef = doc(db, 'gardens', gardenId);
      const gardenSnap = await getDoc(gardenRef);
      if (gardenSnap.exists()) {
        return gardenSnap.data();
      }
      throw new Error();
    } catch (e) {
      console.error(`Error retrieving garden with ID: ${gardenId}`, e);
      navigate('/');
    }
  }

  useEffect(() => {
      fetchData(id)
        .then((data) => {
          console.log(data);
          setGarden(data);
        });
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