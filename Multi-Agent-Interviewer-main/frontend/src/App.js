import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CandidatePage from './pages/CandidatePage';
import AdminPage from './pages/AdminPage';
import PreInterviewPage from './pages/PreInterviewPage';
import InterviewPage from './pages/InterviewPage';
import SimulationPage from './pages/SimulationPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/candidate-dashboard" element={<CandidatePage />} />
          <Route path="/admin-dashboard" element={<AdminPage />} />
          <Route path="/interview-form" element={<PreInterviewPage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/simulation" element={<SimulationPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;