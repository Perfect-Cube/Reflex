import React, { useState, useMemo } from 'react';
import './WorksheetModal.css';

// IMPORTANT: Replace these IDs with the unique IDs from your own editable Google Sheets.
const worksheetIds = [
  '1-AbcdeFgHiJkLmNoPqRsTuVwXyZ_12345', // Replace with your Sheet 1 ID
  '2-aBcDeFgHiJkLmNoPqRsTuVwXyZ_67890', // Replace with your Sheet 2 ID
  '3-abCDeFgHiJkLmNoPqRsTuVwXyZ_54321', // Replace with your Sheet 3 ID
];

const getEmbedUrl = (id) => `https://docs.google.com/spreadsheets/d/${id}/edit?rm=minimal&amp;widget=false&amp;headers=false&amp;chrome=false`;

const WorksheetModal = ({ onClose }) => {
  // Memoize the selected sheet so it doesn't change on re-renders
  const selectedSheetUrl = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * worksheetIds.length);
    return getEmbedUrl(worksheetIds[randomIndex]);
  }, []);

  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="modal-overlay">
      <div className="modal-content worksheet-modal">
        <div className="modal-header">
          <h2>Excel Worksheet Task</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="worksheet-instructions">
          <p><strong>Instructions:</strong> The worksheet below is fully editable. Please read the question within the sheet and use formulas to find the answer. Tell the interviewer your final result when you are done.</p>
        </div>
        <div className="worksheet-embed">
          {isLoading && <div className="loader">Loading Worksheet...</div>}
          <iframe
            src={selectedSheetUrl}
            title="Excel Worksheet Task"
            onLoad={() => setIsLoading(false)}
          ></iframe>
        </div>
        <button onClick={onClose} className="action-btn close-worksheet-btn">
          I'm Done, Close Worksheet
        </button>
      </div>
    </div>
  );
};

export default WorksheetModal;