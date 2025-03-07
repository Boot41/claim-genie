import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUpload, FaSpinner, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { uploadFileToCloudinary } from '../utils/cloudinary';

const GEMINI_API_KEY = "AIzaSyDCuedtf9Z87HdVac-YNB2pNnPH2CDOV2k";

function AddPolicy() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State variables
  const [policyFile, setPolicyFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [processingStep, setProcessingStep] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  
  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPolicyFile(file);
    } else {
      toast.error('Please upload a PDF file');
      e.target.value = null;
    }
  };

  // Upload file to Cloudinary
  const handleUpload = async () => {
    if (!policyFile) {
      toast.error('Please select a file to upload');
      return;
    }
    
    try {
      setIsUploading(true);
      const url = await uploadFileToCloudinary(policyFile);
      setFileUrl(url);
      toast.success('File uploaded successfully');
      setIsUploading(false);
      
      // Move to processing step
      extractPolicyData(url);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file. Please try again.');
      setIsUploading(false);
    }
  };

  // Extract policy data using Gemini
  const extractPolicyData = async (url) => {
    setIsProcessing(true);
    setProcessingStep(1);
    
    try {
      // Simulating processing steps with progress updates
      // In a real application, you would parse the PDF and extract text
      
      // Step 1: Extract text from PDF (simulated)
      setProcessingProgress(20);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Generate prompt for Gemini
      setProcessingProgress(40);
      setProcessingStep(2);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const prompt = `
You are a health insurance policy analyzer. I have uploaded a health insurance policy document.
Please analyze it and extract the following information in JSON format:
1. Policy number (format as string)
2. Coverage details (extract as a JSON object with key coverage areas and their limits/details)
3. Exclusions (extract as a JSON array of excluded conditions or scenarios)
4. Any other relevant information for a health insurance claim system

The PDF URL is: ${url}

Return only the JSON object without any explanation or additional text. Format should be:
{
  "policy_number": "string",
  "coverage_details": { object with key-value pairs },
  "exclusions": [ array of strings ],
  "additional_info": { any other relevant details }
}
`;
      
      // Step 3: Call Gemini API
      setProcessingProgress(60);
      setProcessingStep(3);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      const extractedText = data.candidates[0].content.parts[0].text;
      
      // Process the response to get valid JSON
      const jsonStr = extractedText.replace(/```json|```/g, '').trim();
      const extractedJson = JSON.parse(jsonStr);
      
      setProcessingProgress(80);
      setProcessingStep(4);
      setExtractedData(extractedJson);
      
      // Pre-fill form fields
      if (extractedJson.policy_number) {
        setPolicyNumber(extractedJson.policy_number);
      }
      
      // Step 4: Complete processing
      setProcessingProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Error processing policy:', error);
      toast.error('Failed to process policy data. Please try again or enter details manually.');
      // Continue to form with empty values
      setProcessingProgress(100);
    } finally {
      setIsProcessing(false);
    }
  };

  // Save policy to backend
  const handleSavePolicy = async (e) => {
    e.preventDefault();
    
    if (!policyNumber || !startDate || !endDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      
      // Prepare policy data
      const policyData = {
        policy_number: policyNumber,
        coverage_details: extractedData ? extractedData.coverage_details : {},
        exclusions: extractedData ? extractedData.exclusions : [],
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        document_url: fileUrl
      };
      
      console.log('Sending policy data:', policyData);
      
      // Send to API
      const response = await fetch('http://localhost:8000/api/policies/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(policyData)
      });
      
      if (!response.ok) {
        // Log the full response for debugging
        console.error('API Error Response:', response.status, response.statusText);
        
        let errorMessage = 'Failed to save policy';
        try {
          const responseText = await response.text();
          console.error('Response body:', responseText);
          
          // Try to parse as JSON if possible
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.detail || JSON.stringify(errorData);
          } catch (jsonError) {
            // Not JSON, use text as is
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        } catch (textError) {
          console.error('Error reading response text:', textError);
        }
        
        throw new Error(errorMessage);
      }
      
      toast.success('Policy added successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving policy:', error);
      toast.error('Failed to save policy. Please try again. Check the console for details.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="text-primary-600 hover:text-primary-700 flex items-center mr-4"
        >
          <FaArrowLeft className="mr-1" /> Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Policy</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload Policy Document</h2>
        <p className="text-gray-600 mb-4">
          Upload your policy document (PDF) to automatically extract details, or you can enter the information manually.
        </p>
        
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <input
              type="file"
              onChange={handleFileChange}
              accept="application/pdf"
              className="hidden"
              id="policy-file"
              disabled={isUploading || isProcessing}
            />
            <label
              htmlFor="policy-file"
              className={`btn ${policyFile ? 'btn-outline' : 'btn-primary'} flex items-center cursor-pointer`}
            >
              <FaUpload className="mr-2" /> 
              {policyFile ? policyFile.name : 'Select Policy PDF'}
            </label>
            
            {policyFile && !fileUrl && (
              <button
                onClick={handleUpload}
                className="btn btn-primary"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> Uploading...
                  </>
                ) : (
                  'Upload & Process'
                )}
              </button>
            )}
          </div>
          
          {isProcessing && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {processingStep === 1 && 'Extracting text from document...'}
                  {processingStep === 2 && 'Preparing for AI analysis...'}
                  {processingStep === 3 && 'Analyzing policy with AI...'}
                  {processingStep === 4 && 'Processing AI results...'}
                </span>
                <span className="text-sm font-medium text-gray-700">{processingProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary-600 h-2.5 rounded-full"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        {(fileUrl || !policyFile) && (
          <form onSubmit={handleSavePolicy}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="col-span-2">
                <label htmlFor="policy-number" className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Number *
                </label>
                <input
                  type="text"
                  id="policy-number"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  className="input w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input w-full"
                  required
                />
              </div>
            </div>
            
            {extractedData && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  Extracted Policy Details
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-2">Coverage Details</h4>
                  <pre className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200 overflow-auto max-h-40">
                    {JSON.stringify(extractedData.coverage_details, null, 2)}
                  </pre>
                  
                  <h4 className="font-medium text-gray-700 mt-4 mb-2">Exclusions</h4>
                  <ul className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200 max-h-40 overflow-auto">
                    {extractedData.exclusions.map((exclusion, index) => (
                      <li key={index} className="mb-1">{exclusion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> Saving...
                  </>
                ) : (
                  'Save Policy'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AddPolicy;
