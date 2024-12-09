import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import SignIn from './components/signIn';
import UserList from './components/UserList';
import UploadCars from './components/UploadCars';
import AutoPriceAnalyze from './components/AutoPriceAnalyze';
import Diagram from './components/Diagram';
import TotalPriceCal from './components/TotalPriceCal';
import BelowMMR from './components/BelowMMR';

import './App.css';

function Header() {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('loggedInUser');
  const navigate = useNavigate();
  
  if (location.pathname === '/' || !isLoggedIn) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/');
  };

  return (
    <div>
      {/* Persistent Header */}
      <div id="topLeftTitle">Auto Prices Analyze</div>
      <div id="userSection">
        <span id="username">{isLoggedIn}</span>
        <button id="logoutButton" onClick={handleLogout}>Logout</button>
      </div>
      
      {/* Navigation Tabs */}
      <div className="radio-inputs">
        <label className="radio">
          <Link to="/autoprice-analyze">
            <input type="radio" name="radio" checked={location.pathname === '/autoprice-analyze'} readOnly />
            <span className="name">Search</span>
          </Link>
        </label>
        <label className="radio">
          <Link to="/autoprice-analyze/diagram">
            <input type="radio" name="radio" checked={location.pathname === '/autoprice-analyze/diagram'} readOnly />
            <span className="name">Diagram</span>
          </Link>
        </label>
        <label className="radio">
          <Link to="/upload-cars">
            <input type="radio" name="radio" checked={location.pathname === '/upload-cars'} readOnly />
            <span className="name">Upload</span>
          </Link>
        </label>
        <label className="radio">
          <Link to="/total-price">
            <input 
              type="radio" 
              name="radio" 
              checked={location.pathname === '/total-price'} 
              readOnly 
            />
            <span className="name">Total Price</span>
          </Link>
        </label>
        <label className="radio">
          <Link to="/below-mmr">
            <input 
              type="radio" 
              name="radio" 
              checked={location.pathname === '/below-mmr'} 
              readOnly 
            />
            <span className="name">Below MMR</span>
          </Link>
        </label>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/autoprice-analyze" element={<AutoPriceAnalyze />} />
          <Route path="/autoprice-analyze/diagram" element={<Diagram />} />
          <Route path="/upload-cars" element={<UploadCars />} />
          <Route path="/total-price" element={<TotalPriceCal />} />
          <Route path="/below-mmr" element={<BelowMMR />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
