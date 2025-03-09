import React, { useState } from 'react';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    fetch('http://localhost:8000/api/upload/', {  // adjust URL as needed
      method: 'POST',
      body: formData,
      credentials: 'include', // to include session cookies
    })
      .then((res) => res.json())
      .then((data) => setUploadStatus(data.message))
      .catch((error) => {
        console.error(error);
        setUploadStatus('Error uploading file.');
      });
  };

  return (
    <div>
      <h2>Upload your Health Policy PDF</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <p>{uploadStatus}</p>
    </div>
  );
}

export default FileUpload;