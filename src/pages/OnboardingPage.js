import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.css';

const Onboarding = () => {
  const [location, setLocation] = useState("Indoor");
  const [dimensions, setDimensions] = useState("2 × 5 ft");
  const [template, setTemplate] = useState("Empty");

  return (
    <div className="container d-flex flex-column align-items-center py-4" style={{ backgroundColor: "#CCDED3", minHeight: "100vh" }}>
      <header className="text-center mb-4">
        <h2 className="fw-bold">MYMEADOW</h2>
        <p className="text-muted">Grow with ease, nurture with care.</p>
      </header>

      <h3 className="mb-3">Customize Your Garden!</h3>

      <div className="mb-3">
        <label className="form-label">Garden location:</label>
        <div className="btn-group w-100">
        <button
          style={{
            backgroundColor: location === "Indoor" ? "#3B6255" : "transparent",
            borderColor: "#3B6255",
            color: location === "Indoor" ? "#fff" : "#3B6255",
          }}
          className="btn"
          onClick={() => setLocation("Indoor")}
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

      <button style={{ backgroundColor: "#3B6255", borderColor: "#3B6255", color: "#fff" }} className="btn w-50">
        Create
      </button>
    </div>
  );
};

export default Onboarding;
