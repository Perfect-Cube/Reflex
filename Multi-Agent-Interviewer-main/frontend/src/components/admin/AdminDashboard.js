import React, { useState } from 'react';
import ApplicationDetail from './ApplicationDetail';
import CandidateApplications from './CandidateApplications';
import AgentAnalytics from './AgentAnalytics';
import './AdminDashboard.css';

const dummyCandidates = [
  { id: 101, name: "John Doe", date: "2025-09-10", status: "Interviewed" },
  { id: 102, name: "Jane Smith", date: "2025-09-11", status: "Interviewed" },
  { id: 103, name: "Peter Jones", date: "2025-09-12", status: "Selected" },
];

const AdminDashboard = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState('candidates'); // 'candidates' or 'analytics'

  if (selectedCandidate) {
    return <ApplicationDetail candidate={selectedCandidate} onBack={() => setSelectedCandidate(null)} />;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'candidates' ? 'active' : ''}`}
          onClick={() => setActiveTab('candidates')}
        >
          Candidate Applications
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Agent Analytics
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'candidates' ? (
          <CandidateApplications 
            candidates={dummyCandidates} 
            onSelectCandidate={setSelectedCandidate} 
          />
        ) : (
          <AgentAnalytics />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;