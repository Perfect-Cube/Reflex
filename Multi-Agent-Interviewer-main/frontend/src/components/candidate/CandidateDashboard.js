// candidate/CandidateDashboard.js
import React from 'react';
import './CandidateDashboard.css';

const applications = [
  { id: 1, role: "Excel Financial Analyst", status: "Interview Pending" },
  { id: 2, role: "Data Visualization Expert", status: "Turned Down" },
];

const CandidateDashboard = () => {
  const handleTakeInterview = () => {
    window.open('/interview-form', '_blank');
  };

  return (
    <div className="dashboard-container">
      <h1>My Applications</h1>
      <div className="application-list">
        {applications.map(app => (
          <div key={app.id} className="card application-item">
            <div className="job-info">
              <h3>{app.role}</h3>
              <span className="status">{app.status}</span>
            </div>
            {app.status === "Interview Pending" && (
              <button className="action-btn btn-primary" onClick={handleTakeInterview}>
                Take Interview
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateDashboard;