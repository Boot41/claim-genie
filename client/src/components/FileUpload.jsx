import React, { useEffect, useState } from 'react';
import { FaUpload, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

function FileUpload() {

  useEffect(() => {
    // Clean up the session storage on component unmount
    return () => {
      sessionStorage.removeItem('pdf_text');
      sessionStorage.removeItem('pdf_tables');
      sessionStorage.removeItem('conversation_history');
    };
  }, []);

  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    const selected = event.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setUploadStatus('');
    } else {
      toast.error('Please select a valid PDF file.');
      event.target.value = null;
      setFile(null);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast.error('No file selected.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    fetch('http://localhost:8000/api/upload/', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((data) => {
        setUploadStatus(data.message);
        toast.success(data.message);
        // Save PDF content to localStorage
        localStorage.setItem('pdf_text', data.pdf_text);
        localStorage.setItem('pdf_tables', data.pdf_tables);
      })
      .catch((error) => {
        console.error(error);
        setUploadStatus('Error uploading file.');
        toast.error('Error uploading file.');
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Upload your Health Policy PDF</h2>
      
      <div className="flex items-center space-x-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          id="policy-file-upload"
          className="hidden"
        />
        <label
          htmlFor="policy-file-upload"
          className="cursor-pointer px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
        >
          {file ? file.name : 'Select PDF'}
        </label>
        <button
          onClick={handleUpload}
          disabled={isUploading || !file}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <FaSpinner className="animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <FaUpload /> Upload
            </>
          )}
        </button>
      </div>
      {uploadStatus && (
        <p className="mt-3 text-gray-700">
          {uploadStatus}
        </p>
      )}
    </div>
  );
}

export default FileUpload;