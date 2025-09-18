// src/services/api.js

// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api'; // Fallback for local

/**
 * A helper function to streamline API requests.
 * @param {string} endpoint - The API endpoint to call (e.g., '/interviews').
 * @param {object} options - Configuration for the fetch request (method, body, headers).
 * @returns {Promise<any>} - The JSON response from the API.
 */
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const config = { ...options, headers };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      // Try to get a more specific error message from the API response body
      const errorBody = await response.json().catch(() => ({ detail: 'Unknown API error' }));
      throw new Error(errorBody.detail || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API request failed for endpoint: ${endpoint}`, error);
    // Re-throw the error so components can handle it
    throw error;
  }
};

// --- API Service Functions ---

/**
 * Starts a new interview session.
 * @param {string} candidateName - The name of the candidate.
 * @returns {Promise<{interviewId: number, message: string}>}
 */
export const startInterview = (candidateName) => {
  return request('/interview/start', {
    method: 'POST',
    body: JSON.stringify({ candidate_name: candidateName }),
  });
};

/**
 * Sends a chat message to the backend.
 * @param {number} interviewId - The ID of the current interview.
 * @param {string} message - The user's message text.
 * @returns {Promise<{message: string, isTerminated: boolean}>}
 */
export const sendMessage = (interviewId, message) => {
  return request(`/interview/${interviewId}/chat`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
};

/**
 * Fetches all interviews for the admin dashboard.
 * @returns {Promise<Array<object>>}
 */
export const getInterviews = () => {
  return request('/interviews');
};

/**
 * Fetches the full transcript for a specific interview.
 * @param {number} interviewId - The ID of the interview.
 * @returns {Promise<Array<object>>}
 */
export const getTranscript = (interviewId) => {
  return request(`/interview/${interviewId}/transcript`);
};

/**
 * Fetches the AI-generated report for a specific interview.
 * @param {number} interviewId - The ID of the interview.
 * @returns {Promise<object>}
 */
export const getReport = (interviewId) => {
  return request(`/report/${interviewId}`);
};

/**
 * Submits admin feedback for an interview.
 * @param {number} interviewId - The ID of the interview being reviewed.
 * @param {string} feedbackText - The admin's feedback.
 * @returns {Promise<object>}
 */
export const submitFeedback = (interviewId, feedbackText) => {
  return request('/feedback', {
    method: 'POST',
    body: JSON.stringify({ interview_id: interviewId, feedback_text: feedbackText }),
  });
};

/**
 * Triggers a new agent-vs-agent simulation.
 * @returns {Promise<object>}
 */
export const runSimulation = () => {
  return request('/simulation/run', { method: 'POST' });
};