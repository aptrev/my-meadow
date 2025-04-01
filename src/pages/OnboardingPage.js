import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.css';
import { useNavigate } from "react-router-dom";
import shelfImage from '../images/shelf.png';
import cobblestoneImage from '../images/cobblestone.png';

const Onboarding = () => {
  const [location, setLocation] = useState("Indoor");
  const [dimensions, setDimensions] = useState("2 × 5 ft");
  const [template, setTemplate] = useState("Empty");

  const navigate = useNavigate();

  const handleSubmit = () => {
    const newGarden = {
      id: Date.now(),
      name: `My Garden ${Date.now() % 10000}`,
      location,
      dimensions,
      template,
      plants: [] // start empty
    };
  
    const existingGardens = JSON.parse(localStorage.getItem("gardens")) || [];
    const updatedGardens = [...existingGardens, newGarden];
  
    localStorage.setItem("gardens", JSON.stringify(updatedGardens));
    localStorage.setItem("selectedGardenId", newGarden.id);
  
    if (location === "Indoor") {
      navigate("/indoor");
    } else {
      navigate("/outdoor");
    }
  };

  // Template options depending on location
  const getTemplateOptions = () => {
    if (location === "Indoor") {
      return (
        <>
          <option value="Empty">Empty</option>
          <option value="Shelf">Shelf</option>
        </>
      );
    } else {
      return (
        <>
          <option value="Empty">Empty</option>
          <option value="Cobblestone">Cobblestone</option>
        </>
      );
    }
  };

  // Preview image based on location and template
  const getTemplatePreview = () => {
    if (template === "Empty") {
      return <div style={{ width: "100%", height: "100%", backgroundColor: "white" }}></div>;
    }
    if (location === "Indoor" && template === "Shelf") {
      return <img src={shelfImage} alt="Shelf Preview" style={{ width: "8rem", height: "auto" }} />;
    }
    if (location === "Outdoor" && template === "Cobblestone") {
      return <img src={cobblestoneImage} alt="Cobblestone Preview" style={{ width: "6rem", height: "auto" }} />;
    }
    return null;
  };

  return (
    <div className="container d-flex flex-column align-items-center py-4" style={{ backgroundColor: "#CCDED3", minHeight: "100vh" }}>
      <header className="text-center mb-4">
        <h2 className="fw-bold">MYMEADOW</h2>
        <p className="text-muted">Grow with ease, nurture with care.</p>
      </header>

      <h3 className="mb-3">Customize Your Garden!</h3>

      <div className="mb-3 w-100" style={{ maxWidth: "300px" }}>
        <label className="form-label">Garden location:</label>
        <div className="btn-group w-100">
          <button
            style={{
              backgroundColor: location === "Indoor" ? "#3B6255" : "transparent",
              borderColor: "#3B6255",
              color: location === "Indoor" ? "#fff" : "#3B6255",
            }}
            className="btn"
            onClick={() => {
              setLocation("Indoor");
              setTemplate("Empty"); // reset template for indoor
            }}
          >
            Indoor
          </button>

          <button
            style={{
              backgroundColor: location === "Outdoor" ? "#3B6255" : "transparent",
              borderColor: "#3B6255",
              color: location === "Outdoor" ? "#fff" : "#3B6255",
            }}
            className="btn"
            onClick={() => {
              setLocation("Outdoor");
              setTemplate("Empty"); // reset template for outdoor
            }}
          >
            Outdoor
          </button>
        </div>
      </div>

      <div className="mb-3 w-100" style={{ maxWidth: "300px" }}>
        <label className="form-label">Garden dimensions:</label>
        <select
          className="form-select"
          value={dimensions}
          onChange={(e) => setDimensions(e.target.value)}
        >
          <option>2 × 5 ft</option>
          <option>3 × 6 ft</option>
          <option>4 × 8 ft</option>
        </select>
      </div>

      <div className="mb-3 w-100" style={{ maxWidth: "300px" }}>
        <label className="form-label">Pick template:</label>
        <select
          className="form-select mb-2"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        >
          {getTemplateOptions()}
        </select>

        <div
          className="border p-3 rounded bg-white d-flex justify-content-center align-items-center"
          style={{ width: "100%", height: "150px" }}
        >
          {getTemplatePreview()}
        </div>
      </div>

      <button
        style={{ backgroundColor: "#3B6255", borderColor: "#3B6255", color: "#fff" }}
        className="btn w-50"
        onClick={handleSubmit}
      >
        Create
      </button>
    </div>
  );
};

export default Onboarding;
