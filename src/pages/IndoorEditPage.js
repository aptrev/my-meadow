import React, { useEffect, useState } from 'react';
// import { Stage, Layer, Image as KonvaImage, Rect } from "react-konva";
import useImage from "use-image";
import shelf from "../images/shelf.png";
import pot from "../images/pot1.png";
import add from "../images/add.png";
import flowers from "../images/flowers.png";
import ferns from "../images/ferns.png";
import veggies from "../images/veggies.png";
import mylist from "../images/mylist.png";
import all from "../images/all.png";
import '../style/indooredit.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const IndoorEditPage = () => {
  const [potImage] = useImage(pot);

  const navigate = useNavigate();


  // indoor page
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    const selectedTemplate = localStorage.getItem("selectedTemplate");
    setTemplate(selectedTemplate);
  }, []);

  return (
    <div className="indooredit">
      <header>
        <div className="top-bar">
          <select>
            <option>My Garden 1</option>
          </select>
          <button id="edit-btn" onClick={() => {
              navigate("/indoor");
            }}>Save</button>
        </div>
      </header>

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

    </div>
  );
};

export default IndoorEditPage;
