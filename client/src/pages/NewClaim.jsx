// NewClaim.jsx

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaSpinner, FaArrowLeft, FaFilePdf } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ClaimChatbot from "../components/ClaimChatbot";
import ClaimSummaryDisplay from "../components/ClaimSummaryDisplay";

function NewClaim() {
  const navigate = useNavigate();

  const [policies, setPolicies] = useState([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [completedClaim, setCompletedClaim] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch policies on component mount.
  useEffect(() => {
    const fetchPolicies = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to create a new claim.");
        navigate("/login");
        return;
      }
      try {
        setIsLoadingPolicies(true);
        const response = await fetch("http://localhost:8000/api/policies/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched policies:", data);
          setPolicies(data);
        } else {
          console.error(`Error fetching policies: ${response.status}`);
          toast.error("Failed to load your policies. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching policies:", error);
        toast.error("Failed to load your policies. Please try again.");
      } finally {
        setIsLoadingPolicies(false);
      }
    };

    fetchPolicies();
  }, [navigate]);

  // Set the selected policy.
  const handlePolicySelect = (e) => {
    const policyNumber = e.target.value;
    const policy = policies.find((p) => p.policy_number === policyNumber);
    if (policy) {
      setSelectedPolicy(policy);
      console.log("Selected policy:", policy);
    }
  };

  // Receive the completed claim from the chatbot.
  const handleClaimComplete = (claimData) => {
    console.log("Claim completed:", claimData);
    setCompletedClaim({
      ...claimData,
      policy: selectedPolicy.id,
      policy_number: selectedPolicy.policy_number,
    });
  };

  // Submit the claim to the backend.
  const handleSubmitClaim = async () => {
    if (!completedClaim) {
      toast.error("Please complete the claim form first.");
      return;
    }

    // Validate required fields.
    const requiredFields = {
      treatmentDescription: "Treatment description",
      hospitalDetails: "Hospital details",
      incidentDate: "Incident date",
      treatmentDate: "Treatment date",
    };

    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!completedClaim[field]) missingFields.push(label);
    }
    if (missingFields.length > 0) {
      toast.error(`Please provide the following information: ${missingFields.join(", ")}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      // Convert dates into ISO format.
      const formattedIncidentDate = new Date(completedClaim.incidentDate).toISOString();
      const formattedTreatmentDate = new Date(completedClaim.treatmentDate).toISOString();

      const claimData = {
        policy: completedClaim.policy,
        policy_number: completedClaim.policy_number,
        customer_name: completedClaim.customerName,
        incident_date: formattedIncidentDate,
        treatment_date: formattedTreatmentDate,
        incident_description: completedClaim.incidentDescription,
        treatment: completedClaim.treatmentDescription,
        treatment_money: completedClaim.treatmentAmount,
        coverage_check: completedClaim.coverageCheck,
        hospital_details: completedClaim.hospitalDetails,
        doctor_details: completedClaim.doctorDetails,
        document_url: completedClaim.documentUrl || "",
        claim_summary: completedClaim.claimSummary,
        status: "pending",
        claim_date: new Date().toISOString().split("T")[0]
      };

      console.log("Submitting claim data:", claimData);
      const response = await fetch("http://localhost:8000/api/claims/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(claimData),
      });
      if (response.ok) {
        const result = await response.json();
        console.log("Claim submission successful:", result);
        toast.success("Claim submitted successfully!");
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        console.error("Error submitting claim:", errorData);
        toast.error(`Failed to submit claim: ${errorData.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting claim:", error);
      toast.error("An error occurred while submitting your claim. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Allow user to go back to policy selection.
  const handleBackToSelection = () => {
    setSelectedPolicy(null);
    setCompletedClaim(null);
  };

  // Render policy selection if no policy is chosen.
  if (!selectedPolicy) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">File a New Claim</h1>
        {isLoadingPolicies ? (
          <div className="flex items-center justify-center p-10">
            <FaSpinner className="animate-spin text-primary-600 text-2xl mr-2" />
            <p>Loading your policies...</p>
          </div>
        ) : policies.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-lg mb-4">You don't have any policies registered yet.</p>
            <button
              onClick={() => navigate("/add-policy")}
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            >
              Add Your First Policy
            </button>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="mb-4">
              To start filing a claim, please select the policy you want to claim against:
            </p>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Select Policy:</label>
              <select
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                onChange={handlePolicySelect}
                defaultValue=""
              >
                <option value="" disabled>
                  -- Select a policy --
                </option>
                {policies.map((policy) => (
                  <option key={policy.id} value={policy.policy_number}>
                    {policy.policy_number}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-gray-500 italic">
              Note: Please have your treatment details and supporting documents ready for a smooth claim filing process.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={handleBackToSelection}
          className="mr-4 text-primary-600 hover:text-primary-700 flex items-center"
        >
          <FaArrowLeft className="mr-1" /> Back to Policy Selection
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          File a Claim for Policy #{selectedPolicy.policy_number}
        </h1>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-primary-50 border-b border-primary-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-primary-800">{selectedPolicy.provider_name}</h2>
              <p className="text-sm text-gray-600">
                Policy #{selectedPolicy.policy_number} |{" "}
                {selectedPolicy.coverage_details &&
                Object.keys(selectedPolicy.coverage_details).length > 0
                  ? `Coverage: ${Object.keys(selectedPolicy.coverage_details).join(", ")}`
                  : "Basic Coverage"}
              </p>
            </div>
            {selectedPolicy.document_url && (
              <a
                href={selectedPolicy.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-800 flex items-center"
              >
                <FaFilePdf className="mr-1 text-3xl" />
                <p className="text-sm">View Policy Document</p>
              </a>
            )}
          </div>
        </div>
        <div className="p-6">
          {!completedClaim ? (
            <div className="h-[500px]">
              <ClaimChatbot onClaimComplete={handleClaimComplete} initialPolicyData={selectedPolicy} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border border-green-200 bg-green-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Claim Summary</h3>
                <ClaimSummaryDisplay claimSummary={completedClaim.claimSummary} />
              </div>
              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={handleBackToSelection}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitClaim}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-primary-400 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Claim"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewClaim;