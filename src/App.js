import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Onboarding from "./pages/OnboardingPage";
import Indoor from "./pages/IndoorPage";
import Outdoor from "./pages/OutdoorPage";
import OutdoorEditPage from "./pages/OutdoorEditPage";
import CalendarPage from "./pages/CalendarPage"
import IndoorEdit from "./pages/IndoorEditPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/indoor" element={<Indoor />} />
        <Route path="/outdoor" element={<Outdoor />} />
        <Route path="/outdoor/edit" element={<OutdoorEditPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/indoor/edit" element={<IndoorEdit />} />
      </Routes>
    </Router>
  );
}

export default App;
