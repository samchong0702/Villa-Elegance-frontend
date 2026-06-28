import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function UploadView() {
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [selectedFolder, setSelectedFolder] = useState('');
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/folders');
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to fetch folders');
        }
        
        const data = await response.json();
        setFolders(data.folders || []);
      } catch (error) {
        console.error('Error fetching folders:', error);
        alert(`Failed to load folders: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolders();
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const droppedFile = acceptedFiles[0];
      setFile(droppedFile);
      setFileName(droppedFile.name);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false
  });

  const handleUpload = async () => {
    if (!file || !selectedFolder || !fileName) return;

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', selectedFolder);
      formData.append('fileName', fileName);
      formData.append('description', description);

      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Upload failed');
      }

      setUploadSuccess(true);
      // Reset form
      setFile(null);
      setFileName('');
      setDescription('');
      setSelectedFolder('');
      
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Failed to upload file: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="view-container fade-in" style={{ padding: '2rem', height: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ marginBottom: '2rem' }}>Upload Document</h2>
      
      <div style={{ display: 'flex', gap: '3rem', height: 'calc(100% - 4rem)' }}>
        {/* Left Side: Drag and Drop */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
          <div 
            {...getRootProps()} 
            style={{ 
              flex: '1',
              border: `2px dashed ${isDragActive ? '#4a90e2' : '#ccc'}`, 
              borderRadius: '12px', 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDragActive ? '#f0f8ff' : '#f9f9f9',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              padding: '2rem',
              textAlign: 'center'
            }}
          >
            <input {...getInputProps()} />
            {file ? (
              <div>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📄</div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{file.name}</h3>
                <p style={{ margin: 0, color: '#666' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <p style={{ marginTop: '1rem', color: '#4a90e2', fontSize: '0.9rem', fontWeight: '500' }}>Click or drag to replace file</p>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem', color: '#ccc' }}>📤</div>
                {isDragActive ? (
                  <p style={{ color: '#4a90e2', fontSize: '1.2rem', margin: 0, fontWeight: '500' }}>Drop the file here ...</p>
                ) : (
                  <>
                    <p style={{ color: '#444', fontSize: '1.2rem', margin: '0 0 0.5rem 0', fontWeight: '500' }}>Drag & drop a file here</p>
                    <p style={{ color: '#888', margin: 0, fontSize: '0.95rem' }}>or click to browse from your computer</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Form */}
        <div style={{ flex: '1', maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label htmlFor="folder-select" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
              Browse saving path
            </label>
            {isLoading ? (
              <div style={{ padding: '0.75rem', color: '#666' }}>Loading folders...</div>
            ) : (
              <select 
                id="folder-select" 
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.85rem', 
                  borderRadius: '8px', 
                  border: '1px solid #ddd',
                  backgroundColor: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="" disabled>Select a destination folder</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="file-name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
              File Name
            </label>
            <input
              id="file-name"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
              style={{
                width: '100%', 
                padding: '0.85rem', 
                borderRadius: '8px', 
                border: '1px solid #ddd',
                backgroundColor: '#fff',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter file description"
              rows={5}
              style={{
                width: '100%', 
                padding: '0.85rem', 
                borderRadius: '8px', 
                border: '1px solid #ddd',
                backgroundColor: '#fff',
                fontSize: '1rem',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button 
            onClick={handleUpload}
            style={{
              marginTop: 'auto',
              padding: '1rem',
              backgroundColor: '#1a73e8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: (file && selectedFolder && fileName && !isUploading) ? 'pointer' : 'not-allowed',
              opacity: (file && selectedFolder && fileName && !isUploading) ? 1 : 0.6,
              transition: 'opacity 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            disabled={!file || !selectedFolder || !fileName || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </div>

      {uploadSuccess && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: '#4caf50',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'slideUp 0.3s ease-out',
          zIndex: 1000,
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>✅</span>
          Upload Successful!
        </div>
      )}
    </div>
  );
}
