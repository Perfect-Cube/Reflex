import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [userType, setUserType] = useState('candidate');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  // State for form inputs and error messages
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (isLogin) {
      if (userType === 'candidate') {
        if (email === 'candidate1@abc.com' && password === 'Candidate@123') {
          navigate('/candidate-dashboard');
        } else {
          setError('Invalid candidate credentials. Please try again or sign up.');
        }
      } else if (userType === 'admin') {
        if (email === 'admin1@cn.com' && password === 'Admin@123') {
          navigate('/admin-dashboard');
        } else {
          setError('Invalid admin credentials.');
        }
      }
    } else {
        // Handle signup logic - for this PoC, just show a message.
        setError("Sign-up is not implemented in this demo. Please use the provided login credentials.");
    }
  };

  return (
    <div className="login-container">
      <div className="card login-form">
        <h2>{isLogin ? 'Welcome Back!' : 'Create an Account'}</h2>
        
        <div className="auth-toggle">
          <button className={userType === 'candidate' ? 'active' : ''} onClick={() => setUserType('candidate')}>
            Candidate
          </button>
          <button className={userType === 'admin' ? 'active' : ''} onClick={() => setUserType('admin')}>
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="action-btn btn-primary login-submit-btn">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => setIsLogin(!isLogin)} className="switch-link">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;