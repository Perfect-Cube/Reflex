import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import TranscriptModal from '../common/TranscriptModal';
import './AgentAnalytics.css';

const AgentAnalytics = () => {
  // State to hold the transcript messages for the modal. `null` means the modal is closed.
  const [simulationResult, setSimulationResult] = useState(null);
  // State to disable the button while a simulation is in progress.
  const [isLoading, setIsLoading] = useState(false);
  // A ref to hold the WebSocket connection object across re-renders without triggering them.
  const wsRef = useRef(null);

  // This cleanup effect runs only when the component is unmounted (e.g., user navigates to another tab).
  // It ensures that any active WebSocket connection is properly closed.
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  /**
   * Initiates the real-time agent simulation.
   */
  const handleSimulate = () => {
    setIsLoading(true);
    // Open the modal immediately with a "starting" message for instant user feedback.
    setSimulationResult([{type: 'ai', speaker: 'System', text: 'Simulation starting... Please wait for the first message.'}]); 

    // Establish the WebSocket connection to the backend's simulation endpoint.
    // const ws = new WebSocket('ws://localhost:8000/api/ws/simulation');
    const renderUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
    const ws = new WebSocket(`wss://${renderUrl}/ws/simulation`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Simulation WebSocket connected.');
    };

    /**
     * Handles incoming messages from the WebSocket server.
     */
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Handle turn-by-turn updates from the backend stream.
      if (data.type === 'turn') {
        const newTurn = {
          type: data.data.sender.includes('Candidate') ? 'user' : 'ai',
          speaker: data.data.sender.replace('_Agent', ''),
          text: data.data.text,
        };
        // Use the functional form of setState to append the new message.
        setSimulationResult(prev => {
          // Replace the initial "starting..." message with the first real turn.
          const filtered = prev.filter(msg => msg.speaker !== 'System');
          return [...filtered, newTurn];
        });
      } else if (data.type === 'complete') {
        // Add a final completion message and re-enable the button.
        setSimulationResult(prev => [
            ...prev,
            {type: 'ai', speaker: 'System', text: data.message, highlight: true}
        ]);
        setIsLoading(false); 
      } else if (data.type === 'error') {
        alert(`Simulation Error: ${data.message}`);
        setSimulationResult(null); // Close modal on error.
      }
    };

    /**
     * Handles the closing of the WebSocket connection.
     */
    ws.onclose = () => {
      setIsLoading(false); // Ensure the button is re-enabled when the connection closes.
      console.log('Simulation WebSocket disconnected.');
    };

    /**
     * Handles any connection errors.
     */
    ws.onerror = (error) => {
      setIsLoading(false);
      setSimulationResult(null); // Close the modal on error.
      alert('Failed to connect to the simulation service. Please ensure the backend is running.');
      console.error('Simulation WebSocket Error:', error);
    };
  };

  /**
   * Renders the modal component using a React Portal for proper stacking.
   */
  const renderModal = () => {
    if (simulationResult === null) return null;
    
    return ReactDOM.createPortal(
      <TranscriptModal 
        title="Agent Simulation (Live)"
        content={simulationResult}
        onClose={() => {
            // When the user closes the modal, hide it and also close the WebSocket connection.
            setSimulationResult(null);
            if (wsRef.current) {
              wsRef.current.close();
            }
        }}
      />,
      document.body
    );
  };

  return (
    <>
      {renderModal()}
      <div className="analytics-container">
        <h2>Interviewer Agent Performance</h2>
        <div className="stats-grid">
            <div className="stat-card">
                <h4>Accuracy</h4>
                <p>94.7%</p>
                <span>Evaluation Accuracy</span>
            </div>
            <div className="stat-card">
                <h4>Avg. Time</h4>
                <p>8.2 min</p>
                <span>Avg. Interview Duration</span>
            </div>
            <div className="stat-card">
                <h4>Total Interviews</h4>
                <p>1,204</p>
                <span>Completed This Month</span>
            </div>
            <div className="stat-card">
                <h4>Feedback Score</h4>
                <p>4.8 / 5</p>
                <span>Based on Admin Feedback</span>
            </div>
        </div>
        <div className="card simulation-section">
          <h3>Agent Simulation</h3>
          <p>Run a test interview between the Interviewer Agent and a mock Candidate Agent to monitor behavior in real-time.</p>
          <button className="action-btn btn-dark" onClick={handleSimulate} disabled={isLoading}>
            {isLoading ? 'Simulation in Progress...' : 'Run New Simulation'}
          </button>
        </div>
      </div>
    </>
  );
};

export default AgentAnalytics;