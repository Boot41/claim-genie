import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaFileAlt,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaShieldAlt,
  FaHistory,
  FaFileMedical,
  FaTimes,
} from "react-icons/fa";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

function Dashboard() {
  const [userData, setUserData] = useState({
    claims: [],
    policies: [],
    medicalHistory: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [openPolicies, setOpenPolicies] = useState([]);
  const [showMedicalHistoryModal, setShowMedicalHistoryModal] = useState(false);
  const [newMedicalHistory, setNewMedicalHistory] = useState({
    condition: "",
    diagnosis_date: "",
    treatment: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Helper function: converts snake_case keys to human-friendly labels
  const humanizeKey = (key) => {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // renderValue converts arrays or objects into a nice string display.
  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return value.join(", ");
    } else if (typeof value === "object" && value !== null) {
      return Object.entries(value)
        .map(([k, v]) => `${humanizeKey(k)}: ${v}`)
        .join(" | ");
    }
    return value;
  };

  const togglePolicy = (index) => {
    setOpenPolicies((prev) => {
      const newOpen = [...prev];
      newOpen[index] = !newOpen[index];
      return newOpen;
    });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No authentication token found");
          setIsLoading(false);
          return;
        }

        // Fetch claims
        const claimsResponse = await fetch("http://localhost:8000/api/claims/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        // Fetch policies
        const policiesResponse = await fetch("http://localhost:8000/api/policies/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        // Fetch medical history
        const medicalHistoryResponse = await fetch("http://localhost:8000/api/medical-history/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        let claimsData = [];
        let policiesData = [];
        let medicalHistoryData = [];

        if (claimsResponse.ok) {
          claimsData = await claimsResponse.json();
        } else {
          console.error(`API error fetching claims: ${claimsResponse.status}`);
        }

        if (policiesResponse.ok) {
          policiesData = await policiesResponse.json();
        } else {
          console.error(
            `API error fetching policies: ${policiesResponse.status}`
          );
        }

        if (medicalHistoryResponse.ok) {
          medicalHistoryData = await medicalHistoryResponse.json();
        } else {
          console.error(
            `API error fetching medical history: ${medicalHistoryResponse.status}`
          );
        }

        setUserData({
          policies: policiesData,
          medicalHistory: medicalHistoryData,
          claims: claimsData,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleAddMedicalHistory = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://localhost:8000/api/medical-history/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMedicalHistory),
      });

      if (!response.ok) {
        throw new Error("Failed to add medical history");
      }

      const addedRecord = await response.json();

      setUserData((prev) => ({
        ...prev,
        medicalHistory: [...prev.medicalHistory, addedRecord],
      }));

      setNewMedicalHistory({
        condition: "",
        diagnosis_date: "",
        treatment: "",
      });
      setShowMedicalHistoryModal(false);
    } catch (error) {
      console.error("Error adding medical history:", error);
      alert("Failed to add medical history. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMedicalHistory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
          <p className="text-gray-600">Manage your insurance information</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link to="/new-claim" className="btn btn-primary flex items-center">
            <FaPlus className="mr-2" />
            New Claim
          </Link>
          <Link to="/add-policy" className="btn btn-secondary flex items-center">
            <FaShieldAlt className="mr-2" />
            Add Policy
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <FaSpinner className="animate-spin text-primary-600 text-2xl" />
          <span className="ml-2">Loading your information...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Display Policies */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <FaShieldAlt className="text-primary-600 text-xl mr-2" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Your Insurance Policies
                </h2>
              </div>

              <div className="space-y-4">
                {userData.policies.map((policy, index) => (
                  <div
                    key={policy.id}
                    className="border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <button
                      onClick={() => togglePolicy(index)}
                      className="w-full px-4 py-3 flex justify-between items-center bg-primary-600 hover:bg-primary-700 text-white rounded-t-lg"
                    >
                      <div className="text-left">
                        <h3 className="font-bold text-lg">
                          Policy #{policy.policy_number}
                        </h3>
                        <p className="text-sm opacity-90">
                          {policy.end_date
                            ? new Date(policy.end_date).toLocaleDateString()
                            : ""}
                        </p>
                      </div>
                      <ChevronDownIcon
                        className={`w-5 h-5 transform transition-transform ${
                          openPolicies[index] ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {openPolicies[index] && (
                      <div className="p-4 bg-white border-t">
                        <div className="space-y-4">
                          {/* Coverage Details - Green */}
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-800 mb-2 text-lg">
                              <FaFileMedical className="inline mr-2" />
                              Coverage Details
                            </h4>
                            {policy.coverage_details ? (
                              <ul className="list-disc pl-4 text-gray-700">
                                {Object.entries(policy.coverage_details).map(
                                  ([key, value]) => (
                                    <li key={key}>
                                      <strong>{humanizeKey(key)}:</strong> {renderValue(value)}
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p>No coverage details available</p>
                            )}
                          </div>

                          {/* Exclusions - Red */}
                          <div className="bg-red-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-red-800 mb-2 text-lg">
                              <FaExclamationTriangle className="inline mr-2" />
                              Exclusions
                            </h4>
                            {policy.exclusions && Object.keys(policy.exclusions).length ? (
                              <ul className="list-disc pl-4 text-gray-700">
                                {Object.entries(policy.exclusions).map(
                                  ([key, value]) => (
                                    <li key={key}>
                                      <strong>{humanizeKey(key)}:</strong> {renderValue(value)}
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p>None</p>
                            )}
                          </div>

                          {/* Additional Information - Blue */}
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2 text-lg">
                              Additional Information
                            </h4>
                            {policy.additional_information && Object.keys(policy.additional_information).length ? (
                              <ul className="list-disc pl-4 text-gray-700">
                                {Object.entries(policy.additional_information).map(
                                  ([key, value]) => (
                                    <li key={key}>
                                      <strong>{humanizeKey(key)}:</strong> {renderValue(value)}
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p>None</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Medical History Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FaHistory className="text-primary-600 text-xl mr-2" />
                  <h2 className="text-xl font-semibold">Medical History</h2>
                </div>
                <button
                  onClick={() => setShowMedicalHistoryModal(true)}
                  className="btn btn-primary flex items-center"
                >
                  <FaPlus className="mr-2" />
                  Add Medical History
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Condition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Diagnosis Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Treatment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userData.medicalHistory.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {record.condition}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {record.diagnosis_date
                              ? new Date(record.diagnosis_date).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {record.treatment}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Claims Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <FaFileMedical className="text-primary-600 text-xl mr-2" />
                <h2 className="text-xl font-semibold">Recent Claims</h2>
              </div>

              {userData.claims.length === 0 ? (
                <div className="text-center py-8">
                  <FaFileAlt className="mx-auto text-gray-400 text-4xl mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No claims yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You haven't submitted any insurance claims yet.
                  </p>
                  <Link to="/new-claim" className="btn btn-primary">
                    Create Your First Claim
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Treatment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cause
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userData.claims.map((claim) => (
                        <tr key={claim.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {claim.treatment}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(claim.treatment_date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {claim.cause}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(claim.status)}
                              <span className="ml-2 text-sm text-gray-700">
                                {getStatusText(claim.status)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              to={`/claims/${claim.id}`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showMedicalHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add Medical History</h3>
              <button
                onClick={() => setShowMedicalHistoryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddMedicalHistory}>
              <div className="mb-4">
                <label
                  htmlFor="condition"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Condition
                </label>
                <input
                  type="text"
                  id="condition"
                  name="condition"
                  value={newMedicalHistory.condition}
                  onChange={handleInputChange}
                  required
                  className="input w-full"
                  placeholder="e.g. Hypertension, Diabetes"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="diagnosis_date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Diagnosis Date
                </label>
                <input
                  type="date"
                  id="diagnosis_date"
                  name="diagnosis_date"
                  value={newMedicalHistory.diagnosis_date}
                  onChange={handleInputChange}
                  required
                  className="input w-full"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="treatment"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Treatment
                </label>
                <textarea
                  id="treatment"
                  name="treatment"
                  value={newMedicalHistory.treatment}
                  onChange={handleInputChange}
                  className="input w-full"
                  rows="3"
                  placeholder="Describe the treatment received"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowMedicalHistoryModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" /> Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;