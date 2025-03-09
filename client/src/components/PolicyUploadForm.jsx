import React, { useState } from "react";

function PolicyUploadForm() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a PDF file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("pdf", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/api/gemini-extract-policy-info/", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const err = await response.json();
        setError(err.error || "An error occurred.");
        setResult(null);
      } else {
        const data = await response.json();
        setResult(data.extraction_result);
      }
    } catch (err) {
      setError("Error: " + err.message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-5 border rounded shadow">
      <h2 className="text-2xl font-bold mb-5">Upload Policy PDF</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 text-gray-700" htmlFor="pdf">
          Select PDF:
        </label>
        <input
          id="pdf"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="w-full p-2 border rounded mb-4"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Upload and Extract"}
        </button>
      </form>

      {error && <div className="mt-4 text-red-600">{error}</div>}

      {result && (
        <div className="mt-6 p-4 border rounded bg-gray-100">
          <h3 className="font-bold">Extracted Policy Details:</h3>
          <pre className="whitespace-pre-wrap break-words text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default PolicyUploadForm;