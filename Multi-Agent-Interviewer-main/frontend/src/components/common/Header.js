import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './Header.css';

const Header = ({ userType }) => {
  const navigate = useNavigate();
  const handleLogout = () => navigate('/');
  const goHome = () => {
    if (userType === 'admin') navigate('/admin-dashboard');
    else if (userType === 'candidate') navigate('/candidate-dashboard');
    else navigate('/');
  };

  return (
    <header className="app-header">
      <img src={logo} alt="Coding Ninjas Logo" className="logo-img" onClick={goHome} />
      <div className="user-profile">
        <span>Welcome, {userType === 'admin' ? 'Admin' : 'Candidate'}!</span>
        {/* Correctly using global button styles */}
        <button onClick={handleLogout} className="action-btn btn-primary">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;