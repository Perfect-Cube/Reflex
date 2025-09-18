import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaFileAlt } from 'react-icons/fa';
import { sendMessage } from '../../services/api';
import WorksheetModal from './WorksheetModal';
import './InterviewUI.css';

const InterviewUI = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { interviewId, initialMessage } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isInterviewOver, setIsInterviewOver] = useState(false);
  const [isWorksheetOpen, setIsWorksheetOpen] = useState(false);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);

  const [proctoring, setProctoring] = useState({ warnings: 0, message: '', terminated: false });
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const chatWindowRef = useRef(null);

  // This is the useEffect that was causing the warning.
  useEffect(() => {
    if (!interviewId) {
      navigate('/candidate-dashboard');
      return;
    }

    setMessages([{ sender: 'ai', text: initialMessage }]);

    // const ws = new WebSocket(`ws://localhost:8000/api/ws/proctoring/${interviewId}`);
    const renderUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, ''); // Removes http:// or https://
    const ws = new WebSocket(`wss://${renderUrl}/ws/proctoring/${interviewId}`);
    wsRef.current = ws;

    // --- START OF THE FIX ---
    // Capture the current ref values into local variables inside the effect.
    const videoElement = videoRef.current;
    const webSocket = wsRef.current;
    // --- END OF THE FIX ---

    ws.onopen = () => {
      console.log('Proctoring WebSocket connected.');
      startVideoStream();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'warning') {
        setProctoring(prev => ({ ...prev, warnings: data.count, message: data.message }));
      } else if (data.type === 'terminate') {
        setProctoring({ warnings: 3, message: data.message, terminated: true });
        setIsInterviewOver(true);
        alert(data.message);
      }
    };

    ws.onclose = () => console.log('Proctoring WebSocket disconnected.');
    ws.onerror = (error) => console.error('WebSocket Error:', error);

    // This cleanup function now uses the captured local variables.
    // This guarantees it's referencing the correct elements from when the effect was set up.
    return () => {
      if (webSocket) {
        webSocket.close();
      }
      if (videoElement && videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  // The dependency array remains the same. The linter is now satisfied.
  }, [interviewId, initialMessage, navigate]);

  const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const sendFrame = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN && videoRef.current?.readyState === 4) {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) wsRef.current.send(blob);
          }, 'image/jpeg', 0.5);
        }
      };
      
      const intervalId = setInterval(sendFrame, 2000);
      
      if (wsRef.current) {
          wsRef.current.onclose = () => {
            clearInterval(intervalId);
            console.log('Proctoring WebSocket disconnected, stopping frame sending.');
          };
      }

    } catch (err) {
      console.error("Error accessing camera:", err);
      setProctoring(prev => ({ ...prev, message: "Camera access denied. Proctoring is disabled." }));
    }
  };

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isWaitingForAI]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isInterviewOver || isWaitingForAI) return;

    const userMessage = { sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsWaitingForAI(true);

    try {
      const response = await sendMessage(interviewId, userMessage.text);
      const aiMessage = { sender: 'ai', text: response.message };
      setMessages(prev => [...prev, aiMessage]);
      
      if (response.isTerminated) {
        setIsInterviewOver(true);
        if (wsRef.current) wsRef.current.close();
      }
    } catch (err) {
      const errorMessage = { sender: 'ai', text: "Sorry, there was an error connecting. Please check your connection and try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsWaitingForAI(false);
    }
  };

  return (
    <>
      {isWorksheetOpen && <WorksheetModal onClose={() => setIsWorksheetOpen(false)} />}
      <div className="interview-container">
        <div className="proctor-view">
          <h2>Proctoring Monitor</h2>
          <video ref={videoRef} autoPlay muted playsInline className="camera-feed" />
          <div className="proctor-status card">
            <p><strong>Status:</strong> {proctoring.terminated ? 'Session Ended' : 'Actively Monitored'}</p>
          </div>
          <div className="proctor-warnings card">
            <p><strong>Warnings:</strong> {proctoring.warnings} / 3</p>
            {proctoring.message && <p className="warning-text">{proctoring.message}</p>}
          </div>
          <div className="worksheet-action card">
             <button className="action-btn btn-dark" onClick={() => setIsWorksheetOpen(true)}>
                <FaFileAlt /> Open Worksheet
             </button>
          </div>
        </div>
        <div className="chat-container">
          <div className="chat-window" ref={chatWindowRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}>
                <div className="message-content">{msg.text}</div>
              </div>
            ))}
            {isWaitingForAI && <div className="typing-indicator">Alex is typing...</div>}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isInterviewOver ? "The interview has ended." : "Type your answer here..."}
              disabled={isInterviewOver || isWaitingForAI}
            />
            <button className="action-btn btn-primary" onClick={handleSendMessage} disabled={isInterviewOver || isWaitingForAI}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InterviewUI;