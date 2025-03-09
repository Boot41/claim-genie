import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUpload, FaSpinner, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

function AddPolicy() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State variables
  const [policyFile, setPolicyFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
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

  // Upload file to backend using /api/policies/upload_policy_pdf/
  const handleUpload = async () => {
    if (!policyFile) {
      toast.error('Please select a file to upload');
      return;
    }
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', policyFile);
      const uploadResponse = await fetch("http://localhost:8000/api/upload_policy_pdf/", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || "Upload failed");
      }
      toast.success("Policy PDF uploaded successfully");
      // Optionally record document URL if returned by backend
      setFileUrl(uploadData.document_url || "");
      // Initiate extraction process
      extractPolicyData();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Extract policy details using backend endpoint /api/policies/extract_policy_details/
  const extractPolicyData = async () => {
    try {
      setIsProcessing(true);
      setProcessingStep(1);
      setProcessingProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProcessingStep(2);
      setProcessingProgress(60);
      const response = await fetch("http://localhost:8000/api/extract_policy_details/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Extraction failed");
      }
      
      setExtractedData(data);
      setProcessingStep(3);
      setProcessingProgress(100);
      toast.success("Policy data extracted successfully");
    } catch (error) {
      console.error("Error processing policy:", error);
      toast.error("Failed to extract policy data. Please try again or enter details manually.");
      setProcessingProgress(100);
    } finally {
      setIsProcessing(false);
    }
  };

  // Save policy to backend (using extracted data and document URL)
  const handleSavePolicy = async (e) => {
    e.preventDefault();
    if (!extractedData) {
      toast.error('No extracted policy data available');
      return;
    }
    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      console.log(extractedData)
      // Assemble the policy data from extractedData. Additional fields may be added if required.
      const policyData = {
        policy_number: extractedData.policy_number || "POL" + Math.random().toString(36).substring(2, 9), 
        coverage_details: extractedData.coverage_details || {},
        exclusions: extractedData.exclusions || [],
        additional_information: extractedData.additional_info || {},
        document_url: fileUrl
      };

      console.log('Sending policy data:', policyData);

      const response = await fetch('http://localhost:8000/api/policies/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(policyData)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to save policy';
        try {
          const responseText = await response.text();
          errorMessage = responseText;
        } catch (e) {}
        throw new Error(errorMessage);
      }
      toast.success('Policy added successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving policy:', error);
      toast.error('Failed to save policy. Please try again.');
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
          Upload your policy document (PDF) to automatically extract coverage details and exclusions.
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
                className="btn btn-primary flex gap-2 items-center justify-center"
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
                  {processingStep === 1 && 'Extracting text...'}
                  {processingStep === 2 && 'Analyzing with AI...'}
                  {processingStep === 3 && 'Finalizing extraction...'}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {processingProgress}%
                </span>
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
        
        {/* Display extracted policy details in a friendly, color-coded format */}
        {extractedData && (
          <div className="mt-6 space-y-6">
            <h3 className="text-lg font-semibold flex items-center">
              <FaCheckCircle className="mr-2 text-green-500" /> Extracted Policy Details
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {/* Coverage Details - Green */}
              <div className="p-4 border rounded bg-green-100 text-green-800">
                <h4 className="font-bold mb-1">Coverage Details</h4>
                <p>
                  <strong>Hospitalization:</strong> {extractedData.coverage_details.hospitalization_coverage}
                </p>
                <p>
                  <strong>Cataract Surgery Limit:</strong> {extractedData.coverage_details.cataract_surgery_limit}
                </p>
                <p>
                  <strong>Hernia/Hysterectomy Limit:</strong> {extractedData.coverage_details.hernia_hysterectomy_limit}
                </p>
                <p>
                  <strong>Major Surgery Limit:</strong> {extractedData.coverage_details.major_surgery_limit}
                </p>
              </div>
              
              {/* Exclusions - Red */}
              <div className="p-4 border rounded bg-red-100 text-red-800">
                <h4 className="font-bold mb-1">Exclusions</h4>
                {extractedData.exclusions && extractedData.exclusions.length > 0 ? (
                  <ul className="list-disc ml-5">
                    {extractedData.exclusions.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>None</p>
                )}
              </div>
              
              {/* Additional Information - Blue */}
              <div className="p-4 border rounded bg-blue-100 text-blue-800">
                <h4 className="font-bold mb-1">Additional Information</h4>
                <p>
                  <strong>Insurer:</strong> {extractedData.additional_info.insurance_company}
                </p>
                <p>
                  <strong>Policy Type:</strong> {extractedData.additional_info.policy_type}
                </p>
                <p>
                  <strong>IRDA Reg No:</strong> {extractedData.additional_info.irda_reg_no}
                </p>
                <p>{extractedData.additional_info.operative_clause_note}</p>
              </div>
            </div>
            
            {/* Save Policy Button */}
            <div className="mt-4">
              <button
                onClick={handleSavePolicy}
                className="btn btn-primary w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
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
          </div>
        )}
      </div>
    </div>
  );
}

export default AddPolicy;