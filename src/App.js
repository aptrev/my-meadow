import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Onboarding from "./pages/onboarding";
import Home from "./pages/home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
