import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import {
  FaArrowLeft,
  FaDownload,
  FaFile,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";

function ClaimDetails() {
  const { id } = useParams();
  const [claim, setClaim] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch claim details from the API
    const fetchClaimDetails = async () => {
      try {
        setIsLoading(true);

        // Get the token from localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No authentication token found");
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:8000/api/claims/${id}/detail/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const claimData = await response.json();

        console.log(claimData);
        // Transform API data to match the component's expected format
        const transformedClaim = {
          id: claimData.id,
          type: "Health Insurance", // This would ideally come from the policy type
          date: new Date(claimData.created_at).toISOString().split("T")[0],
          status: claimData.status,
          // Use treatment_money from API if available; otherwise use a default value
          amount: claimData.treatment_money
            ? parseFloat(claimData.treatment_money)
            : 1250.0,
          description: claimData.cause,
          policyNumber: claimData.policy_number,
          policyProvider: claimData.policy_provider,
          policyHolderName: claimData.policy_holder_name,
          incidentDate: new Date(claimData.incident_date)
            .toISOString()
            .split("T")[0],
          incidentDescription: claimData.incident_description,
          claimDetails: claimData.claim_details,
          timeline: claimData.timeline,
          treatmentDate: claimData.treatment_date,
          documents: claimData.documents,
        };

        setClaim(transformedClaim);
      } catch (error) {
        console.error("Error fetching claim details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaimDetails();
  }, [id]);

  // PDF download handler using jsPDF
  const handleDownloadPDF = () => {
    if (!claim) return;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.text(`Claim Summary`, 20, 20);

    // Claim information
    doc.setFontSize(12);
    doc.text(`Claim ID: ${claim.id}`, 20, 30);
    doc.text(`Policy Number: ${claim.policyNumber}`, 20, 40);
    doc.text(`Policy Provider: ${claim.policyProvider}`, 20, 50);
    doc.text(`Policy Holder: ${claim.policyHolderName}`, 20, 60);
    doc.text(
      `Incident Date: ${new Date(claim.incidentDate).toLocaleDateString()}`,
      20,
      70
    );
    doc.text(
      `Treatment Date: ${new Date(claim.treatmentDate).toLocaleDateString()}`,
      20,
      80
    );
    doc.text(`Claimed Amount: $${claim.amount.toFixed(2)}`, 20, 90);
    doc.text(`Status: ${claim.status}`, 20, 100);

    // Descriptions/details
    doc.text(`Incident Description:`, 20, 110);
    doc.text(claim.incidentDescription || "", 20, 120, { maxWidth: 170 });
    doc.text(`Claim Details:`, 20, 140);
    doc.text(claim.claimDetails || "", 20, 150, { maxWidth: 170 });

    // Timeline
    let y = 170;
    doc.text("Timeline:", 20, y);
    claim.timeline.forEach((event) => {
      y += 10;
      doc.text(`${event.date} - ${event.action} (${event.actor})`, 20, y);
    });

    // Trigger the download
    doc.save(`claim_summary_${claim.id}.pdf`);
  };

  // Supporting document download handler
  const handleDownloadDocument = () => {
    if (claim.documents && claim.documents.length > 0) {
      const documentUrl = claim.documents[0].file_path;
      const link = document.createElement("a");
      link.href = documentUrl;
      // Adjust filename and extension based on file type
      link.download = `supporting_doc_${claim.documents[0].id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error("No supporting document available.");
    }
  };

  // Helpers for status icons and classes based on claim status
  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <FaCheckCircle className="text-green-500" />;
      case "pending":
        return <FaSpinner className="text-yellow-500" />;
      case "rejected":
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "pending":
        return "Pending";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-16">
          <FaSpinner className="animate-spin text-primary-600 text-2xl" />
          <span className="ml-2">Loading claim details...</span>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Not Found</h2>
          <p className="text-gray-600 mb-4">
            The claim you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700">
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Claim #{claim.id}</h1>
          <p className="text-gray-600">
            {claim.type} - {new Date(claim.date).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(claim.status)}`}>
            {getStatusIcon(claim.status)}
            <span className="ml-2">{getStatusText(claim.status)}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Claim Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Policy Number</h3>
                  <p className="mt-1 text-sm text-gray-900">{claim.policyNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Insurance Provider</h3>
                  <p className="mt-1 text-sm text-gray-900">{claim.policyProvider}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Policy Holder</h3>
                  <p className="mt-1 text-sm text-gray-900">{claim.policyHolderName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Claim Amount</h3>
                  <p className="mt-1 text-sm text-gray-900">${claim.amount.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Incident Date</h3>
                  <p className="mt-1 text-sm text-gray-900">{new Date(claim.incidentDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Treatment Date</h3>
                  <p className="mt-1 text-sm text-gray-900">{new Date(claim.treatmentDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Submission Date</h3>
                  <p className="mt-1 text-sm text-gray-900">{new Date(claim.date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Incident Description</h3>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{claim.incidentDescription}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Claim Details</h3>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{claim.claimDetails}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Claim Timeline</h2>
              <div className="flow-root">
                <ul className="-mb-8">
                  {claim.timeline.map((event, index) => (
                    <li key={index}>
                      <div className="relative pb-8">
                        {index !== claim.timeline.length - 1 && (
                          <span
                            className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${
                              index < claim.timeline.findIndex((e) => e.completed === false)
                                ? "bg-primary-400"
                                : "bg-gray-200"
                            }`}
                            aria-hidden="true"
                          ></span>
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            {event.completed !== false ? (
                              <span
                                className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                  event.action.includes("approved")
                                    ? "bg-green-100"
                                    : event.action.includes("rejected")
                                    ? "bg-red-100"
                                    : event.action.includes("pending")
                                    ? "bg-yellow-100"
                                    : "bg-primary-100"
                                }`}
                              >
                                <span
                                  className={`text-sm font-medium ${
                                    event.action.includes("approved")
                                      ? "text-green-600"
                                      : event.action.includes("rejected")
                                      ? "text-red-600"
                                      : event.action.includes("pending")
                                      ? "text-yellow-600"
                                      : "text-primary-600"
                                  }`}
                                >
                                  {index + 1}
                                </span>
                              </span>
                            ) : (
                              <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-gray-200">
                                <span className="text-sm font-medium text-gray-500">{index + 1}</span>
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p
                                className={`text-sm ${
                                  event.completed === false
                                    ? "text-gray-400"
                                    : event.action.includes("approved")
                                    ? "text-green-700"
                                    : event.action.includes("rejected")
                                    ? "text-red-700"
                                    : event.action.includes("pending")
                                    ? "text-yellow-700"
                                    : "text-gray-900"
                                }`}
                              >
                                {event.action}
                                {event.completed === false && (
                                  <span className="ml-2 text-xs text-gray-400">(Expected)</span>
                                )}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <p>
                                {new Date(event.date).toLocaleDateString()}
                                {event.completed === false && (
                                  <span className="ml-1 text-xs text-gray-400">(Est.)</span>
                                )}
                              </p>
                              <p className="text-xs">{event.actor}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  className="btn btn-outline w-full flex items-center justify-center"
                  onClick={handleDownloadPDF}
                >
                  <FaDownload className="mr-2" />
                  Download Claim
                </button>
                <button
                  className="btn btn-outline w-full flex items-center justify-center"
                  onClick={handleDownloadDocument}
                >
                  <FaFile className="mr-2" />
                  Show Supporting Docs
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
              <p className="text-sm text-gray-600 mb-4">
                If you have questions about your claim or need assistance, our support team is here to help.
              </p>
              <div className="space-y-3">
                <button className="btn btn-outline w-full">Contact Support</button>
                <button className="btn btn-outline w-full">FAQ</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClaimDetails;