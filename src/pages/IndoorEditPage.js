import React, { useEffect, useState } from 'react';
// import { Stage, Layer, Image as KonvaImage, Rect } from "react-konva";
import useImage from "use-image";
import shelf from "../assets/images/shelf.png";
import pot from "../assets/images/pot1.png";
import add from "../assets/images/add.png";
import flowers from "../assets/images/flowers.png";
import ferns from "../assets/images/ferns.png";
import veggies from "../assets/images/veggies.png";
import mylist from "../assets/images/mylist.png";
import all from "../assets/images/all.png";
import '../style/indooredit.css';
import "bootstrap/dist/css/bootstrap.min.css";
import AppContainer from '../components/AppContainer';
import { collection, addDoc, updateDoc, doc, getDoc, arrayUnion } from "firebase/firestore";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import db from '../firebase/FirebaseDB'

const IndoorEditPage = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const [potImage] = useImage(pot);
  const [garden, setGarden] = useState(null);

  const navigate = useNavigate();

  // indoor page
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    const selectedTemplate = localStorage.getItem("selectedTemplate");
    setTemplate(selectedTemplate);
  }, []);

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

  return (
    <AppContainer className="indooredit">

      {template === "Shelf" && (
        <div className="shelf-wrapper">
          <img src={shelf} alt="Shelf" className="shelf-img" />
          <div className="plant-container">
            {/* TODO: place plant */}
          </div>
        </div>
      )}

      {/* Bottom Toolbar */}
      <div className="toolbar">
        {/* <button className="toolbar-btn" onClick={() => handleItemClick('Pot 1')}>
          <img src={pot1} alt="Pot 1" />
        </button> */}
        <button className="toolbar-btn">
          <img src={add} alt="add button" />
        </button>
        <button className="toolbar-btn" onClick={() => alert('Edit feature coming soon!')}>
          <img src={mylist} alt="my list button" />
        </button>
        <button className="toolbar-btn" onClick={() => alert('Edit feature coming soon!')}>
          <img src={flowers} alt="flowers button" />
        </button>
        <button className="toolbar-btn" onClick={() => alert('Edit feature coming soon!')}>
          <img src={ferns} alt="ferns button" />
        </button>
        <button className="toolbar-btn" onClick={() => alert('Edit feature coming soon!')}>
          <img src={veggies} alt="veggies button" />
        </button>
        <button className="toolbar-btn" onClick={() => alert('Edit feature coming soon!')}>
          <img src={all} alt="all button" />
        </button>
      </div>

    </AppContainer>
  );
};

export default IndoorEditPage;
