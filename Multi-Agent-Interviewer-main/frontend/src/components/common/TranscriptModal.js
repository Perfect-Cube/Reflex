import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './TranscriptModal.css'; // Import the dedicated CSS for this component

const TranscriptModal = ({ title, content, showDownload, onClose }) => {
  // A ref is used to get a direct reference to the DOM element we want to capture for the PDF.
  const contentRef = useRef(null);

  /**
   * Handles the PDF download process.
   * It uses html2canvas to render the modal's body content onto a canvas,
   * then converts that canvas into an image, and finally places that image into a PDF file.
   */
  const handleDownloadPDF = () => {
    const input = contentRef.current;
    if (!input) return;

    // Use html2canvas to capture the content. The 'scale' option improves the image quality.
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      
      // Create a new PDF document in portrait, millimeters, on A4-sized paper.
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Get the dimensions of the PDF and the captured canvas image.
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;

      // Calculate the image dimensions to fit within the PDF with a 15mm margin on each side.
      const imgWidth = pdfWidth - 30; // 15mm margin on left + 15mm on right
      const imgHeight = imgWidth / ratio;

      // Add the captured image to the PDF.
      pdf.addImage(imgData, 'PNG', 15, 15, imgWidth, imgHeight);
      
      // Save the generated PDF with a clean filename.
      pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
    });
  };

  return (
    // The overlay handles closing the modal when the background is clicked.
    <div className="modal-overlay" onClick={onClose}>
      
      {/* stopPropagation prevents the modal from closing when a user clicks *inside* the modal content. */}
      <div className="modal-content card transcript-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="close-btn" aria-label="Close modal">&times;</button>
        </div>

        <div className="modal-body" ref={contentRef}>
          {content.map((item, index) => (
            <div key={index} className={`transcript-item ${item.type}`}>
              <span className="speaker">{item.speaker}:</span>
              <p className={item.highlight ? 'highlight' : ''}>{item.text}</p>
            </div>
          ))}
        </div>
        
        <div className="modal-footer">
          {showDownload && (
            <button onClick={handleDownloadPDF} className="action-btn btn-dark">
              Download PDF
            </button>
          )}
          <button onClick={onClose} className="action-btn btn-primary">
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default TranscriptModal;