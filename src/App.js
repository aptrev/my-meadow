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
        <Route path={`${process.env.PUBLIC_URL}/`} element={<Onboarding />} />
        <Route path={`${process.env.PUBLIC_URL}/indoor`} element={<Indoor />} />
        <Route path={`${process.env.PUBLIC_URL}/outdoor`} element={<Outdoor />} />
        <Route path={`${process.env.PUBLIC_URL}/outdoor/edit`}element={<OutdoorEditPage />} />
        <Route path={`${process.env.PUBLIC_URL}/calendar`} element={<CalendarPage />} />
        <Route path={`${process.env.PUBLIC_URL}/indoor/edit`} element={<IndoorEdit />} />
      </Routes>
    </Router>
  );
}

export default App;
