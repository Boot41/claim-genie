// ClaimSummaryDisplay.jsx

import React from "react";
import ReactMarkdown from "react-markdown";

const ClaimSummaryDisplay = ({ claimSummary }) => {
  return (
    <div
      className="claim-summary-container"
      style={{ padding: "1rem", backgroundColor: "#f7f7f7", borderRadius: "8px" }}
    >
      <ReactMarkdown>{claimSummary}</ReactMarkdown>
    </div>
  );
};

export default ClaimSummaryDisplay;