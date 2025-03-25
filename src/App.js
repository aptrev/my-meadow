import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Onboarding from "./pages/onboarding";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Onboarding />} />
      </Routes>
    </Router>
  );
}

export default App;
