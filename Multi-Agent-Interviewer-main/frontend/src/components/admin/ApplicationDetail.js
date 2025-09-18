import React, { useState } from 'react';
import ReactDOM from 'react-dom'; // Required for rendering modals outside the component's DOM tree
import { getTranscript, getReport, submitFeedback } from '../../services/api';
import { dummyReports, dummyTranscripts } from '../../data/dummyData'; // Import predefined data
import TranscriptModal from '../common/TranscriptModal';
import './ApplicationDetail.css';

const ApplicationDetail = ({ candidate, onBack }) => {
  // State to manage which modal is open: 'transcript', 'report', or null
  const [modalType, setModalType] = useState(null);
  // State to hold the content (transcript or report data) for the modal
  const [modalContent, setModalContent] = useState([]);
  // State to manage loading indicators on buttons while fetching data
  const [isLoading, setIsLoading] = useState(false);
  // State for the feedback textarea
  const [feedbackText, setFeedbackText] = useState("");

  /**
   * Fetches and displays the content for the transcript or report modal.
   * It handles both real API calls and loading local dummy data.
   * @param {'transcript' | 'report'} type - The type of modal to open.
   */
  const showModal = async (type) => {
    setIsLoading(true);
    setModalType(type); // Open the modal immediately to show a loading state
    
    try {
      let content;

      // Check if the selected candidate is a predefined dummy entry
      if (candidate.isDummy) {
        if (type === 'transcript') {
          content = dummyTranscripts[candidate.id] || [];
        } else {
          // Format the dummy report data for the modal component
          const reportData = dummyReports[candidate.id] || {};
          content = [
            { type: 'report', speaker: 'Overall Score', text: `${reportData.score} / 100` },
            { type: 'report', speaker: 'Summary', text: reportData.summary, highlight: true },
            { type: 'report', speaker: 'Strengths', text: reportData.strengths },
            { type: 'report', speaker: 'Weaknesses', text: reportData.weaknesses, highlight: true },
          ];
        }
      } else {
        // If it's a real interview, fetch the data from the backend API
        if (type === 'transcript') {
          const transcriptData = await getTranscript(candidate.id);
          // Format the API response for the modal component
          content = transcriptData.map(msg => ({ 
            type: msg.sender, 
            speaker: msg.sender.charAt(0).toUpperCase() + msg.sender.slice(1), 
            text: msg.text 
          }));
        } else {
          const reportData = await getReport(candidate.id);
          // Format the API response for the modal component
          content = [
            { type: 'report', speaker: 'Overall Recommendation', text: reportData.summary, highlight: true },
            { type: 'report', speaker: 'Proficiency Score', text: `${reportData.score} / 100` },
            { type: 'report', speaker: 'Key Strengths', text: reportData.strengths },
            { type: 'report', speaker: 'Areas for Improvement', text: reportData.weaknesses, highlight: true },
          ];
        }
      }
      setModalContent(content);
    } catch (error) {
      alert(`Could not fetch ${type}. Error: ${error.message}`);
      setModalType(null); // Close the modal if there's an error
    } finally {
      setIsLoading(false); // Stop the loading indicator
    }
  };

  /**
   * Handles the submission of feedback for a real interview.
   */
  const handleFeedbackSubmit = async () => {
    if (candidate.isDummy) {
      alert("Feedback cannot be submitted for dummy applications.");
      return;
    }
    if (feedbackText.trim() === "") return;
    
    try {
      await submitFeedback(candidate.id, feedbackText);
      alert("Feedback submitted successfully! The AI will learn from this in future interviews.");
      setFeedbackText(""); // Clear the textarea
    } catch (error) {
      alert(`Failed to submit feedback. Error: ${error.message}`);
    }
  };

  /**
   * Renders the modal component using a React Portal.
   * A Portal renders its children into a different part of the DOM (here, `document.body`),
   * which is the best practice for overlays to avoid CSS stacking issues.
   */
  const renderModal = () => {
    if (!modalType) return null;
    
    return ReactDOM.createPortal(
      <TranscriptModal
        title={isLoading ? "Loading..." : (modalType === 'transcript' ? 'Interview Transcript' : 'AI Generated Report')}
        content={isLoading ? [] : modalContent}
        showDownload={modalType === 'report'}
        onClose={() => setModalType(null)}
      />,
      document.body
    );
  };

  return (
    <>
      {renderModal()}
      <div className="detail-container">
        <button onClick={onBack} className="action-btn back-btn">&larr; Back to Dashboard</button>
        
        <div className="detail-header">
          <h1>{candidate.candidate_name}</h1>
          <div className="status-updater">
            <label htmlFor="status-select">Application Status:</label>
            <span className={`status-badge status-${candidate.status}`}>{candidate.status}</span>
          </div>
        </div>

        <div className="detail-grid">
          <div className="card detail-card">
            <h3>Interview Analysis</h3>
            <p>View the full conversation and the AI-generated performance summary.</p>
            <div className="button-group">
              <button className="action-btn btn-dark" onClick={() => showModal('transcript')} disabled={isLoading}>
                {isLoading && modalType === 'transcript' ? 'Loading...' : 'View Transcript'}
              </button>
              <button className="action-btn btn-primary" onClick={() => showModal('report')} disabled={isLoading}>
                 {isLoading && modalType === 'report' ? 'Loading...' : 'View AI Report'}
              </button>
            </div>
          </div>

          <div className="card detail-card full-width">
            <h3>Feedback to Agent</h3>
            <p>Help improve our AI by flagging inaccuracies for real interviews.</p>
            <textarea 
              value={feedbackText} 
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder={candidate.isDummy ? "Feedback cannot be submitted for dummy applications." : "e.g., The AI should have asked a follow-up question here..."}
              className="feedback-textarea"
              disabled={candidate.isDummy}
            />
            <button className="action-btn btn-primary feedback-btn" onClick={handleFeedbackSubmit} disabled={candidate.isDummy}>
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplicationDetail;