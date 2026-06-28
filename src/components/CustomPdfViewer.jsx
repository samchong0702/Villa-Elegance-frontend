import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the react-pdf worker for Vite
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const CustomPdfViewer = ({ fileId }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fileId) return;

    let objectUrl = null;

    const fetchPdf = async () => {
      setIsLoading(true);
      setError(null);
      // Reset page and scale when opening a new file
      setPageNumber(1);
      setScale(1.0);
      
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/download-pdf?fileId=${fileId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch PDF');
        }
        
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Could not load the PDF file.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPdf();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileId]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const changeScale = (amount) => {
    setScale(prevScale => Math.max(0.5, Math.min(prevScale + amount, 3.0)));
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '2rem' }}>
        <div className="spinner" style={{ 
          border: '4px solid rgba(0, 0, 0, 0.1)', 
          width: '36px', 
          height: '36px', 
          borderRadius: '50%', 
          borderLeftColor: '#09f', 
          animation: 'spin 1s linear infinite' 
        }}></div>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>{error}</div>;
  }

  const buttonStyle = {
    padding: '8px 16px',
    margin: '0 8px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  };

  return (
    <div className="custom-pdf-viewer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f0f0f0', padding: '1rem', height: '100%' }}>
      {pdfUrl && (
        <>
          <div className="pdf-controls" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: '1rem', 
            padding: '10px', 
            backgroundColor: '#fff', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button 
                type="button" 
                disabled={pageNumber <= 1} 
                onClick={() => changePage(-1)}
                style={{ ...buttonStyle, opacity: pageNumber <= 1 ? 0.5 : 1, cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <span style={{ margin: '0 10px', fontWeight: '500' }}>
                Page {pageNumber} of {numPages || '--'}
              </span>
              <button 
                type="button" 
                disabled={pageNumber >= numPages} 
                onClick={() => changePage(1)}
                style={{ ...buttonStyle, opacity: pageNumber >= numPages ? 0.5 : 1, cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid #ddd', paddingLeft: '15px' }}>
              <button 
                type="button" 
                onClick={() => changeScale(-0.25)}
                style={buttonStyle}
                disabled={scale <= 0.5}
              >
                Zoom Out (-)
              </button>
              <span style={{ margin: '0 10px', fontWeight: '500', minWidth: '60px', textAlign: 'center' }}>
                {Math.round(scale * 100)}%
              </span>
              <button 
                type="button" 
                onClick={() => changeScale(0.25)}
                style={buttonStyle}
                disabled={scale >= 3.0}
              >
                Zoom In (+)
              </button>
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div>Rendering document...</div>}
            >
              <div style={{ marginBottom: '1rem', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </div>
            </Document>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomPdfViewer;
