import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import FiresPage from './pages/FiresPage';
import DisastersPage from './pages/DisastersPage';
import ClimatePage from './pages/ClimatePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/fires" element={<FiresPage />} />
          <Route path="/disasters" element={<DisastersPage />} />
          <Route path="/climate" element={<ClimatePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;