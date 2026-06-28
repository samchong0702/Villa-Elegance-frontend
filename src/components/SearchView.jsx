import React, { useState, useEffect } from 'react';
import CustomPdfViewer from './CustomPdfViewer';
import './SearchView.css';

export default function SearchView() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    // If query is empty, clear results immediately
    if (!query.trim()) {
      setResults([]);
      setSelectedFile(null);
      return;
    }

    // Set up the 300ms debounce
    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search request failed');

        const data = await response.json();
        setResults(data.files || []);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    // Cleanup function to clear the timeout if the user types again before 300ms
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handlePrint = () => {
    if (!selectedFile) return;

    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '0';
      iframe.style.top = '0';
      iframe.style.width = '500px';
      iframe.style.height = '500px';
      iframe.style.zIndex = '9999';
      iframe.src = `http://localhost:5000/api/download-pdf?fileId=${selectedFile.id}`;

      document.body.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow.print();
          } catch (err) {
            console.error('Error invoking print:', err);
          }
        }, 500);

        // Clean up after 10 seconds so you have time to see it
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 10000);
      };
    } catch (error) {
      console.error('Error printing document:', error);
      alert('Failed to print document. Please try again.');
    }
  };

  return (
    <div className="search-view fade-in">
      {/* Left Side: Search Bar & Results */}
      <div className="search-sidebar">
        <input
          type="text"
          className="search-input"
          placeholder="Search documents by name or content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="search-results">
          {isLoading && <div className="loading-state">Searching Drive...</div>}

          {!isLoading && results.length === 0 && query && (
            <div className="empty-state">No documents found.</div>
          )}

          {!isLoading && results.map(file => (
            <div
              key={file.id}
              className={`result-item ${selectedFile?.id === file.id ? 'selected' : ''}`}
              onClick={() => setSelectedFile(file)}
            >
              {file.name}
            </div>
          ))}
        </div>
      </div>

      {/* Right Side: Document Preview & Print */}
      <div className="preview-container">
        {selectedFile ? (
          <>
            <div className="preview-header">
              <h3>{selectedFile.name}</h3>
              {/* Native Print Method */}
              <button
                onClick={handlePrint}
                className="print-button"
              >
                Print Document
              </button>
            </div>
            {/* Custom PDF Viewer */}
            <div className="document-frame" style={{ border: 'none', backgroundColor: '#f0f0f0' }}>
              <CustomPdfViewer key={selectedFile.id} fileId={selectedFile.id} />
            </div>
          </>
        ) : (
          <div className="preview-placeholder">
            <p>Select a document to preview its contents instantly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
