import React, { useState, useEffect, useRef } from 'react';
import './SimulationUI.css';

const simulationScript = [
  { sender: 'interviewer', text: "Hello Candidate Agent. Let's begin the simulation. Please explain the primary use of the XLOOKUP function." },
  { sender: 'candidate', text: "XLOOKUP is a modern replacement for VLOOKUP. Its primary use is to find items in a table or range by row. It defaults to an exact match and can return entire rows or columns, not just one value." },
  { sender: 'interviewer', text: "That is a comprehensive and accurate answer. Next question: How would you create a dynamic chart range that automatically updates when new data is added?" },
  { sender: 'candidate', text: "I would use a combination of the OFFSET and COUNTA functions to define a named range. The COUNTA function would count the number of non-empty cells to determine the height of the range, making it dynamic." },
  { sender: 'interviewer', text: "Correct. That is an effective method. Simulation complete. Performance is within expected parameters." }
];

const SimulationUI = () => {
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(0);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (step < simulationScript.length) {
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, simulationScript[step]]);
        setStep(prev => prev + 1);
      }, 2000); // 2-second delay between messages
      return () => clearTimeout(timer);
    }
  }, [step]);
  
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="simulation-container">
      <h1>Agent Simulation</h1>
      <div className="chat-container">
        <div className="chat-window" ref={chatWindowRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender === 'candidate' ? 'user-message' : 'ai-message'}`}>
               <div className="message-content">
                 <strong>{msg.sender === 'candidate' ? 'Candidate Agent' : 'Interviewer Agent'}: </strong>
                 {msg.text}
               </div>
            </div>
          ))}
           {step < simulationScript.length && <div className="typing-indicator">Agents are conversing...</div>}
           {step === simulationScript.length && <div className="typing-indicator">Simulation Complete.</div>}
        </div>
      </div>
    </div>
  );
};

export default SimulationUI;