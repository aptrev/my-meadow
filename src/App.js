import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Onboarding from "./pages/OnboardingPage";
import Home from "./pages/Home";
import CalendarPage from "./pages/CalendarPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/home" element={<Home />} />
        <Route path="/calendar" element={<CalendarPage />} /> {/* Add this route */}
      </Routes>
    </Router>
  );
}

export default App;
