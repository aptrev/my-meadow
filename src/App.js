import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Onboarding from "./pages/OnboardingPage";
import Indoor from "./pages/IndoorPage";
import Outdoor from "./pages/OutdoorPage";
import CalendarPage from "./pages/CalendarPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/indoor" element={<Indoor />} />
        <Route path="/outdoor" element={<Outdoor />} />
        <Route path="/calendar" element={<CalendarPage />} /> {/* Add this route */}
      </Routes>
    </Router>
  );
}

export default App;
