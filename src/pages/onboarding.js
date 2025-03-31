import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.css';
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const [location, setLocation] = useState("Indoor");
  const [dimensions, setDimensions] = useState("2 × 5 ft");
  const [template, setTemplate] = useState("Empty");

  const navigate = useNavigate();

  const handleSubmit = () => {
    if (location === "Indoor") {
      navigate("/home");
    } else {
      alert("Outdoor garden redirection not yet implemented!");
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center py-4" style={{ backgroundColor: "#D3E3D2", minHeight: "100vh" }}>
      <header className="text-center mb-4">
        <h2 className="fw-bold">MYMEADOW</h2>
        <p className="text-muted">Grow with ease, nurture with care.</p>
      </header>

      <h3 className="mb-3">Customize Your Garden!</h3>

      <div className="mb-3">
        <label className="form-label">Garden location:</label>
        <div className="btn-group w-100">
          <button 
            className={`btn ${location === "Indoor" ? "btn-success" : "btn-outline-success"}`}
            onClick={() => setLocation("Indoor")}
          >
            Indoor
          </button>
          <button 
            className={`btn ${location === "Outdoor" ? "btn-success" : "btn-outline-success"}`}
            onClick={() => setLocation("Outdoor")}
          >
            Outdoor
          </button>
        </div>
      </div>

      <div className="mb-3">
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

      <div className="mb-3">
        <label className="form-label">Pick template:</label>
        <div className="border p-3 rounded bg-white text-center" style={{ width: "250px" }}>
          <p>{template}</p>
        </div>
      </div>

      <button className="btn btn-success w-50" onClick={handleSubmit}>Create</button>
    </div>
  );
};

export default Onboarding;
