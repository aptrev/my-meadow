import React, { useContext, useState } from "react";
import 'bootstrap/dist/css/bootstrap.css';
import { useNavigate } from "react-router-dom";
import shelfImage from '../assets/images/shelf.png';
import cobblestoneImage from '../assets/images/cobblestone.png';
import '../style/home.css';
import AppContainer from "../components/AppContainer/AppContainer";
import { AuthContext } from "../components/AuthProvider";
import { createGarden } from '../utilities/FirebaseUtils'

const getRandomFillRotation = () => {
  const min = 0;
  const max = 360;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getRandomFillScaleX = () => {
  const min = 0.05;
  const max = 0.5;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getRandomFillScaleY = () => {
  const min = 0.05;
  const max = 0.5;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const Onboarding = () => {
  const [location, setLocation] = useState("indoor");
  const [dimensions, setDimensions] = useState("2 × 5 ft");
  const [template, setTemplate] = useState("Empty");
  const [gardenName, setGardenName] = useState(`My Garden ${Date.now() % 10000}`);
  const { user } = useContext(AuthContext);

  const navigate = useNavigate();

  const getDimensions = () => {
    if (dimensions === '2 × 5 ft') {
      return {
        width: 500,
        height: 200,
      }
    } else if (dimensions === '3 × 6 ft') {
      return {
        width: 600,
        height: 300,
      }
    } else if (dimensions === '4 × 8 ft') {
      return {
        width: 800,
        height: 400,
      }
    }
  }

  const handleSubmit = async () => {
    const d = getDimensions();
    const gardenProps = {
      width: d.width / 100,
      height: d.height / 100,
      dimensions_units: 'ft',
      stage: d,
    }

    // const plots = templates[0].plots.map((plot, index) => {
    //   return {
    //     ...plot,
    //     id: `plot-${index}`
    //   }
    // })

    const plots = [];

    const newGarden = {
      ...gardenProps,
      id: null,
      background: '#ffffff',
      name: gardenName,
      location,
      plots,
      plants: [], // start empty
      paths: [],
      objects: [],
      text: [],
      randomFillRotation: getRandomFillRotation(),
      randomFillScaleX: getRandomFillScaleX(),
      randomFillScaleY: getRandomFillScaleY(),
    };

    localStorage.setItem("selectedTemplate", template);

    // Adds new garden to Firestore, navigates to garden page
    createGarden(user.uid, newGarden)
      .then((gardenId) => {
        if (gardenId) {
          localStorage.setItem('savedGarden', JSON.stringify({
            ...newGarden,
            id: gardenId,
        }));
          navigate(`/${location}/${gardenId}`);
        }
      });
  };

  // Template options depending on location
  const getTemplateOptions = () => {
    if (location === "indoor") {
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
    <AppContainer>
      <header className="text-center mb-4">
        <h2 className="fw-bold">MYMEADOW</h2>
        <p className="text-muted">Grow with ease, nurture with care.</p>
      </header>

      <h3 className="mb-3">Customize Your Garden!</h3>

      <div className="mb-3 w-100">
        <label className="form-label">Garden location:</label>
        <div className="btn-group w-100">
          <button
            style={{
              backgroundColor: location === "indoor" ? "#3B6255" : "transparent",
              borderColor: "#3B6255",
              color: location === "indoor" ? "#fff" : "#3B6255",
            }}
            className="btn"
            onClick={() => {
              setLocation("indoor");
              setTemplate("Empty"); // reset template for indoor
            }}
          >
            Indoor
          </button>

          <button
            style={{
              backgroundColor: location === "outdoor" ? "#3B6255" : "transparent",
              borderColor: "#3B6255",
              color: location === "outdoor" ? "#fff" : "#3B6255",
            }}
            className="btn"
            onClick={() => {
              setLocation("outdoor");
              setTemplate("Empty"); // reset template for outdoor
            }}
          >
            Outdoor
          </button>
        </div>
      </div>

      <div className="mb-3 w-100" style={{ maxWidth: "300px" }}>
        <div className="mb-3 w-100" style={{ maxWidth: "300px" }}>
          <label className="form-label">Garden Name:</label>
          <input
            type="text"
            className="form-control"
            value={gardenName}
            onChange={(e) => setGardenName(e.target.value)}
          />
        </div>

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
    </AppContainer>
  );
};

export default Onboarding;
