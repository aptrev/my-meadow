import React, { useEffect, useState } from "react";
import plantsData from "../data/plants.json";
// import { getDoc, doc } from "firebase/firestore";
// import { FirebaseDB } from "../firebase/FirebaseDB";

import "../style/toolbar.css";
import '../style/home.css';
import '../style/outdooredit.css';

export default function PlantSearch({ onSearchSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [plants, setPlants] = useState([]);

  useEffect(() => {
    setPlants(plantsData);
  }, []);
  // useEffect(() => {
  //   const fetchPlants = async () => {
  //     try {
  //       const gardenId = localStorage.getItem("gardenId"); // or however you track the current garden
  //       if (!gardenId) {
  //         console.warn("No garden ID found");
  //         return;
  //       }
  
  //       const gardenRef = doc(db, "gardens", gardenId);
  //       const gardenSnap = await getDoc(gardenRef);
  
  //       if (gardenSnap.exists()) {
  //         const gardenData = gardenSnap.data();
  //         setPlants(gardenData.plants || []);
  //       } else {
  //         console.warn("No such garden in Firestore");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching garden plants:", error);
  //     }
  //   };
  
  //   fetchPlants();
  // }, []);
  

  const filteredPlants = plants.filter((plant) => {
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "" || plant.type === selectedType;
    return matchesSearch && matchesType;
  });
  

  return (
    <div className="plant-search px-3 w-100">
      <input
        type="text"
        placeholder="Search for a plant..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="form-control mb-3"
      />

      {/* Dropdown Filter */}
      <select
        className="form-select mb-3"
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
      >
        <option value="">All Types</option>
        <option value="flower">Flower</option>
        <option value="herb">Herb</option>
        <option value="vegetable">Vegetable</option>
        <option value="fruit">Fruit</option>
      </select>

      <div className="element-grid">
        {filteredPlants.map((plant) => (
          <div
            className="element-container"
            key={plant.id}
            onClick={() => onSearchSelect(plant)}
          >
            <div className="element">
              <img src={require(`../assets/images/plants/${plant.image}`)} alt={plant.name} title={plant.name} />
              <div className="element-overlay">
                <p className="element-overlay-tip ms-1">Click to Add</p>
              </div>
            </div>
            <p className="label">{plant.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
