/**
 * ClaimHelper - Utility for managing claim conversations and data collection
 * 
 * This helper ensures all required information is collected during claim conversations
 * and outputs clean markdown for claim summaries
 */

// Required fields for a complete claim
const REQUIRED_CLAIM_FIELDS = [
  'policyNumber',
  'patientName',
  'treatmentDate',
  'medicalCondition',
  'treatment',
  'hospital',
  'hospitalAddress',
  'doctorName',
  'doctorContact',
  'billedAmount',
  'documentUrl'
];

// Optional fields that may be provided by AI estimation
const AI_ESTIMATION_FIELDS = [
  'estimatedAmount',
  'totalCost',
  'coverageExplanation'
];

/**
 * Initializes a new claim conversation state object
 * @returns {Object} Empty claim state with all required fields set to null
 */
export const initializeClaimState = () => {
  const claimState = {};
  
  // Initialize required fields
  REQUIRED_CLAIM_FIELDS.forEach(field => {
    claimState[field] = null;
  });
  
  // Initialize AI estimation fields
  AI_ESTIMATION_FIELDS.forEach(field => {
    claimState[field] = null;
  });
  
  return claimState;
};

/**
 * Updates the claim state with new information
 * @param {Object} currentState - Current claim state
 * @param {String} field - Field to update
 * @param {*} value - New value for the field
 * @returns {Object} Updated claim state
 */
export const updateClaimState = (currentState, field, value) => {
  const validFields = [...REQUIRED_CLAIM_FIELDS, ...AI_ESTIMATION_FIELDS];
  
  if (!validFields.includes(field)) {
    console.warn(`Unknown field: ${field}`);
    return currentState;
  }
  
  return {
    ...currentState,
    [field]: value
  };
};

/**
 * Updates the claim state with AI-estimated values
 * @param {Object} currentState - Current claim state
 * @param {Object} estimationData - Data from AI estimation
 * @returns {Object} Updated claim state with AI estimations
 */
export const updateWithAIEstimation = (currentState, estimationData) => {
  const updatedState = { ...currentState };
  
  // Update with AI estimation fields if they exist
  AI_ESTIMATION_FIELDS.forEach(field => {
    if (estimationData[field] !== undefined) {
      updatedState[field] = estimationData[field];
    }
  });
  
  return updatedState;
};

/**
 * Checks if all required fields have been collected
 * @param {Object} claimState - Current claim state
 * @returns {Array} List of missing field names, empty if all fields are present
 */
export const getMissingFields = (claimState) => {
  return REQUIRED_CLAIM_FIELDS.filter(field => !claimState[field]);
};

/**
 * Generates a markdown summary of the claim
 * @param {Object} claimState - Current claim state
 * @returns {String} Markdown formatted claim summary
 */
export const generateClaimSummary = (claimState) => {
  const missingFields = getMissingFields(claimState);
  
  if (missingFields.length > 0) {
    return `### Incomplete Claim\nThe following information is still needed:\n${missingFields.map(field => `- ${formatFieldName(field)}`).join('\n')}`;
  }
  
  // Determine which amount to display
  const amountToShow = claimState.estimatedAmount 
    ? `$${claimState.estimatedAmount} (AI estimated)` 
    : `$${claimState.billedAmount}`;
  
  // Include total cost if available
  const totalCostSection = claimState.totalCost 
    ? `- **Total Cost:** $${claimState.totalCost}\n` 
    : '';
  
  // Include coverage explanation if available
  const coverageExplanationSection = claimState.coverageExplanation 
    ? `\n### Coverage Analysis\n${claimState.coverageExplanation}\n` 
    : '';
  
  return `## Claim Summary

### Patient Information
- **Policy Number:** ${claimState.policyNumber}
- **Patient Name:** ${claimState.patientName}

### Treatment Details
- **Date:** ${claimState.treatmentDate}
- **Medical Condition:** ${claimState.medicalCondition}
- **Treatment:** ${claimState.treatment}
- **Claim Amount:** ${amountToShow}
${totalCostSection}
### Healthcare Provider Information
- **Hospital:** ${claimState.hospital}
- **Hospital Address:** ${claimState.hospitalAddress}
- **Doctor:** ${claimState.doctorName}
- **Doctor Contact:** ${claimState.doctorContact}

### Documentation
- **Supporting Documents:** ${claimState.documentUrl ? 'Provided' : 'Not Provided'}
${coverageExplanationSection}
Please review this information for accuracy before submission.`;
};

/**
 * Formats a camelCase field name to a user-friendly format
 * @param {String} field - Field name in camelCase
 * @returns {String} User-friendly field name
 */
export const formatFieldName = (field) => {
  if (!field) return '';
  
  // Convert camelCase to space-separated words and capitalize first letter
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

/**
 * Determines the next question to ask based on missing fields
 * @param {Object} claimState - Current claim state
 * @returns {Object} Object containing the next field to ask about and the question text
 */
export const getNextQuestion = (claimState) => {
  // Define the exact order of questions
  const questionOrder = [
    'patientName',
    'treatmentDate',
    'medicalCondition',
    'treatment',
    'billedAmount',
    // Coverage check happens here (not a field)
    'hospital',
    'hospitalAddress',
    'doctorName',
    'doctorContact',
    'documentUrl'
  ];
  
  // Find the first missing field in the specified order
  const nextField = questionOrder.find(field => !claimState[field]);
  
  if (!nextField) {
    return { 
      field: null,
      question: "I have all the information I need. Would you like to review your claim summary?"
    };
  }
  
  // Rest of the function remains the same...
  let question = "";
  switch (nextField) {
    case 'policyNumber':
      question = "What is your policy number?";
      break;
    case 'patientName':
      question = "What is the patient's full name?";
      break;
    case 'treatmentDate':
      question = "When did the treatment occur? Please provide the date.";
      break;
    case 'medicalCondition':
      question = "What medical condition were you diagnosed with?";
      break;
    case 'treatment':
      question = "What treatment did you receive?";
      break;
    case 'hospital':
      question = "What is the name of the hospital where you received treatment?";
      break;
    case 'hospitalAddress':
      question = "What is the complete address of the hospital?";
      break;
    case 'doctorName':
      question = "What is the full name of the doctor who provided the treatment?";
      break;
    case 'doctorContact':
      question = "What is the contact information (phone or email) for the doctor?";
      break;
    case 'billedAmount':
      question = "What is the total amount billed for the treatment?";
      break;
    case 'documentUrl':
      question = "Please upload any supporting documents for your claim (bills, prescriptions, etc.)";
      break;
    default:
      question = `Please provide your ${formatFieldName(nextField)}`;
  }
  
  return { field: nextField, question };
};
