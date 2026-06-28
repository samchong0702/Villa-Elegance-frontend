import React, { useState } from 'react';
import SearchView from './components/SearchView';
import UploadView from './components/UploadView';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="app-container">
      <nav className="top-nav glass-effect">
        <div className="logo">Villa Elegance</div>
        <div className="nav-buttons">
          <button 
            className={`nav-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Search
          </button>
          <button 
            className={`nav-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload
          </button>
        </div>
      </nav>

      <main className="main-content glass-effect fade-in">
        {activeTab === 'search' ? <SearchView /> : <UploadView />}
      </main>
    </div>
  );
}

export default App;
