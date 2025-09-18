import React from 'react';
// The line below was incorrect. It should import from 'react-dom/client'.
import ReactDOM from 'react-dom/client'; 
import './index.css';
import App from './App';

// We removed the reportWebVitals import to fix the previous error.

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);