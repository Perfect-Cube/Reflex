import React, { useState, useEffect } from 'react';
import { getInterviews } from '../../services/api';
import './CandidateApplications.css';

const dummyInterviews = [
  { id: 101, candidate_name: "Priya Sharma", status: "selected", isDummy: true },
  { id: 102, candidate_name: "Rahul Kumar", status: "rejected", isDummy: true },
  { id: 103, candidate_name: "Anjali Singh", status: "interviewed", isDummy: true },
];

/**
 * Processes a list of interviews to return only the latest entry for each unique candidate name.
 * @param {Array<object>} interviews - The raw list of interviews from the API.
 * @returns {Array<object>} - A filtered list of unique, latest interviews.
 */
const getUniqueLatestInterviews = (interviews) => {
  const latestInterviews = new Map();
  
  // The list is already sorted by ID desc in the API, so the first one we see is the latest.
  for (const interview of interviews) {
    if (!latestInterviews.has(interview.candidate_name)) {
      latestInterviews.set(interview.candidate_name, interview);
    }
  }
  
  return Array.from(latestInterviews.values());
};

const CandidateApplications = ({ onSelectCandidate }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const realInterviews = await getInterviews();
        const uniqueRealInterviews = getUniqueLatestInterviews(realInterviews);

        // Combine with dummies, ensuring no name conflicts.
        const combined = [...uniqueRealInterviews];
        dummyInterviews.forEach(dummy => {
            if (!combined.some(real => real.candidate_name === dummy.candidate_name)) {
                combined.push(dummy);
            }
        });
        
        setInterviews(combined);

      } catch (err) {
        setError('Failed to fetch applications. Displaying sample data.');
        setInterviews(dummyInterviews); // Fallback to dummies on API error
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  if (loading) return <p>Loading applications...</p>;

  return (
    <div className="list-container">
      <h2>Candidate Applications</h2>
      {error && <p className="error-message">{error}</p>}
      {interviews.length === 0 ? (
        <p>No interview applications found.</p>
      ) : (
        <ul className="candidate-list">
          {interviews.map(interview => (
            <li key={interview.id} className="candidate-item">
              <div className="candidate-info">
                <h3>{interview.candidate_name}</h3>
                <span>Latest Interview ID: {interview.id}</span>
              </div>
              <div className="candidate-status">
                <span className={`status-badge status-${interview.status}`}>{interview.status}</span>
                <button className="action-btn view-details-btn" onClick={() => onSelectCandidate(interview)}>
                  View Details
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CandidateApplications;