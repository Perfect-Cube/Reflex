import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { startInterview } from '../../services/api'; // Import API service
import './PreInterviewForm.css';

const PreInterviewForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '', resume: null });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const { name, email, mobile, resume } = formData;
    setIsFormValid(!!(name && email && mobile && resume));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    setError('');
    try {
      // Call the backend to start the interview session
      const response = await startInterview(formData.name);
      
      // Navigate to the interview page, passing the initial data from the backend via state
      navigate('/interview', { 
        state: { 
          interviewId: response.interviewId, 
          initialMessage: response.message 
        } 
      });
    } catch (err) {
      setError(err.message || 'Failed to start interview. Please try again later.');
      setIsLoading(false);
    }
  };

  return (
    <div className="card pre-interview-form">
      <h2>Interview Details</h2>
      <p>Please confirm your information before proceeding.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input type="text" id="name" name="name" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="mobile">Mobile Number</label>
          <input type="tel" id="mobile" name="mobile" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="resume">Upload Resume (PDF, DOCX)</label>
          <input type="file" id="resume" name="resume" accept=".pdf,.docx" onChange={handleChange} required />
        </div>
        <button type="submit" className="action-btn btn-primary form-submit-btn" disabled={!isFormValid || isLoading}>
          {isLoading ? 'Starting...' : 'Proceed to Interview'}
        </button>
        {error && <p style={{color: 'red', textAlign: 'center', marginTop: '1rem'}}>{error}</p>}
      </form>
    </div>
  );
};

export default PreInterviewForm;