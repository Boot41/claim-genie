// ClaimChatbot.jsx

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { uploadFileToCloudinary } from "../utils/cloudinary";
import axios from "axios";
import ReactMarkdown from 'react-markdown';


function ClaimChatbot({ onClaimComplete, initialPolicyData }) {
  // Track the current conversation step.
  const [step, setStep] = useState(0);

  // State for claim fields.
  const [customerName, setCustomerName] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [treatmentDate, setTreatmentDate] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");
  const [treatmentDescription, setTreatmentDescription] = useState("");
  const [treatmentAmount, setTreatmentAmount] = useState("");
  const [coverageCheck, setCoverageCheck] = useState("");
  const [hospitalDetails, setHospitalDetails] = useState("");
  const [doctorDetails, setDoctorDetails] = useState("");
  const [supportingDocUrl, setSupportingDocUrl] = useState("");
  const [extractedText, setExtractedText] = useState("Not Provided");

  // Prompt message and loading state.
  const [chatbotPrompt, setChatbotPrompt] = useState("");
  const [loadingPrompt, setLoadingPrompt] = useState(false);

  // Define steps (order matters):
  // 0. Customer name
  // 1. Incident date
  // 2. Treatment date
  // 3. Incident description
  // 4. Treatment description
  // 5. Treatment money amount (claim amount)
  // 6. Policy coverage check (actual Gemini API call; will then be simplified)
  // 7. Hospital details
  // 8. Doctor details
  // 9. Supporting document upload
  // 10. Generating claim file
  const steps = [
    "Please provide the customer's name who wants to claim.",
    "Please provide the incident date.",
    "Please provide the treatment date.",
    "Please describe what happened.",
    "Please describe the treatment you received.",
    "Please provide the treatment money amount(in Dollars).",
    "Please upload your supporting document (select file).",
    "Determining policy coverage. Please wait...",
    "Please provide the hospital name and address (separate name and location by a comma).",
    "Please provide the doctor's name and contact (separate name and phone by a comma).",
    "Generating your claim file..."
  ];

  // Function to call Gemini API using your provided API key.
  const callGemini = async (promptText) => {
    const key = "AIzaSyDCuedtf9Z87HdVac-YNB2pNnPH2CDOV2k";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptText }]
            }
          ]
        })
      });
      if (!response.ok) {
        console.error("Gemini API response error", response.status);
        return null;
      }
      const data = await response.json();
      // Extract the formatted text from the first candidate.
      const output =
        data.candidates &&
        data.candidates.length > 0 &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.length > 0
          ? data.candidates[0].content.parts[0].text
          : null;
      return output;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return null;
    }
  };

  // Update prompt on step change.
  useEffect(() => {
    if (step === 7) {
      checkPolicyCoverage();
    } else if (step === steps.length - 1) {
      generateClaimSummary();
    } else {
      setChatbotPrompt(steps[step]);
    }
  }, [step]);

  // Call Gemini API for actual policy coverage check, then simplify the result.
  const checkPolicyCoverage = async () => {
    setLoadingPrompt(true);
    console.log(initialPolicyData.coverage_details, treatmentAmount, incidentDescription, extractedText)
    const coveragePrompt = `Based on the following policy coverage details: ${JSON.stringify(
      initialPolicyData.coverage_details
    )} , the following data(provided by user):
Treatment Amount: ${treatmentAmount}
Incident Description: ${incidentDescription} and text extracted from supporting document: ${extractedText}
Determine whether this claim will be covered.
If covered, reply with "Covered" and a brief explanation.
If partially covered, reply with "Partially Covered" and a brief explanation.
If not covered, reply with "Not Covered" and a brief explanation.
give answer with proper no.`;
    
    const technicalResult = await callGemini(coveragePrompt);
    if (technicalResult) {
      // Now simplify the explanation.
      const simplifyPrompt = "Simplify the following explanation in simple, user-friendly language with short sentences, so that the customer easily understands: " + technicalResult;
      const simpleResult = await callGemini(simplifyPrompt);
      const finalResult = simpleResult || technicalResult;
      setCoverageCheck(finalResult);
      setChatbotPrompt(`Policy Coverage Result: ${finalResult} If you wish to continue, click "Next".`);
    } else {
      setChatbotPrompt("Failed to determine policy coverage, please try again later.");
    }
    setLoadingPrompt(false);
  };

  // Generate a formatted claim summary.
  const generateClaimSummary = async () => {
    setLoadingPrompt(true);
    const currentDate = format(new Date(), "MMMM d, yyyy");

    // Build a Markdown formatted summary.
    const formattedSummary = `
**Claim ID:** (To be assigned by Claims Department)

**Date Prepared:** ${currentDate}

**I. Claimant Information:**

* **Customer Name:** ${customerName}

**II. Incident Details:**

* **Incident Date:** ${incidentDate}
* **Treatment Date:** ${treatmentDate}
* **Incident Description:** ${incidentDescription}

**III. Treatment Details:**

* **Treatment Description:** ${treatmentDescription}
* **Treatment Amount:** ${treatmentAmount}

**IV. Provider Information:**

* **Hospital Name:** ${hospitalDetails.split(",")[0] || ""}
* **Hospital Location:** ${hospitalDetails.split(",")[1] || ""}
* **Doctor Name:** ${doctorDetails.split(",")[0] || ""}
* **Doctor Phone:** ${doctorDetails.split(",")[1] || ""}

**V. Policy Coverage & Recommendation:**

* **Policy Coverage Check:** ${coverageCheck.includes("Covered") ? "Covered" : "Not Covered"}
* **Justification:** ${coverageCheck}
* **Coverage Details:** Based on the treatment amount of ${treatmentAmount}, the services fall within the policy limits.

**VI. Supporting Document:**

* ${supportingDocUrl ? `[View Document](${supportingDocUrl})` : "No document provided."}

**VII. Recommendation:**

* **Recommended Action:** ${coverageCheck.includes("Covered") ? "Process claim for reimbursement." : "Further review required."}
* **Notes:** Verify provider credentials. Confirm specific services rendered and applicable policy benefits.

**Disclaimer:** This summary is based on the information provided and is subject to verification and final approval by the Claims Department.
    `;
    // Pass the formatted summary and data back.
    onClaimComplete({
      customerName,
      incidentDate,
      treatmentDate,
      incidentDescription,
      treatmentDescription,
      treatmentAmount,
      coverageCheck,
      hospitalDetails,
      doctorDetails,
      claimSummary: formattedSummary,
      documentUrl: supportingDocUrl, // Save the Cloudinary URL.
    });
    setChatbotPrompt("Claim summary generated and submitted!");
    setLoadingPrompt(false);
  };

  // Handle text input for steps (except file upload step).
  const handleSubmit = (e) => {
    e.preventDefault();
    const input = e.target.elements.userInput.value.trim();
    if (!input) return;
    switch (step) {
      case 0:
        setCustomerName(input);
        break;
      case 1:
        setIncidentDate(input);
        break;
      case 2:
        setTreatmentDate(input);
        break;
      case 3:
        setIncidentDescription(input);
        break;
      case 4:
        setTreatmentDescription(input);
        break;
      case 5:
        setTreatmentAmount(input);
        break;
      case 8:
        setHospitalDetails(input);
        break;
      case 9:
        setDoctorDetails(input);
        break;
      default:
        break;
    }
    e.target.elements.userInput.value = "";
    setStep((prev) => prev + 1);
  };

  // Handle file upload at step 9.
  const handleSupportingFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoadingPrompt(true);
    try {
      const secureUrl = await uploadFileToCloudinary(file);
      setSupportingDocUrl(secureUrl);
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('http://localhost:8000/api/ocr/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data.text);
      setExtractedText(response.data.text);
      setChatbotPrompt("Supporting document uploaded successfully. Click Next to continue.");
    } catch (error) {
      console.error("Upload failed:", error);
      setChatbotPrompt("File upload failed. Please try again.");
    }
    setLoadingPrompt(false);
  };

  return (
    <div className="p-4">
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p>{loadingPrompt ? "Loading..." : <ReactMarkdown>{chatbotPrompt}</ReactMarkdown>}</p>
      </div>
      {/* For file upload step (step 6), render file input */}
      {step === 6 ? (
        <div className="flex space-x-2">
          <input type="file" name="docFile" onChange={handleSupportingFileUpload} />
          <button
            onClick={() => setStep((prev) => prev + 1)}
            disabled={loadingPrompt || !supportingDocUrl}
            className="px-4 py-2 bg-primary-600 text-white rounded"
          >
            Next
          </button>
        </div>
      ) : (
        // Render text-input form for other steps.
        step < steps.length - 1 && (
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              name="userInput"
              placeholder="Type your answer..."
              className="flex-grow p-2 border rounded"
              disabled={loadingPrompt}
            />
            <button
              type="submit"
              disabled={loadingPrompt}
              className="px-4 py-2 bg-primary-600 text-white rounded"
            >
              Next
            </button>
          </form>
        )
      )}
      {/* Special case: for step 6 (coverage check), allow a separate Next button */}
      {step === 7 && (
        <button
          onClick={() => setStep((prev) => prev + 1)}
          disabled={loadingPrompt}
          className="mt-2 px-4 py-2 bg-primary-600 text-white rounded"
        >
          Next
        </button>
      )}
    </div>
  );
}

export default ClaimChatbot;