/**
 * Gemini API integration for ClaimGenie
 * This utility provides functions to interact with Google's Gemini API
 */

// Replace with your actual Gemini API key
const GEMINI_API_KEY = "AIzaSyDCuedtf9Z87HdVac-YNB2pNnPH2CDOV2k";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/**
 * Generate a response from Gemini API
 * @param {string} prompt - The user's prompt
 * @param {Object} context - Additional context for the AI (claim details, policy info, etc.)
 * @returns {Promise<string>} - The AI-generated response
 */
export const generateGeminiResponse = async (prompt, context = {}) => {
  try {
    // Create a structured prompt with context
    const structuredPrompt = createStructuredPrompt(prompt, context);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: structuredPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,  // Lower temperature for more focused responses
          topK: 20,         // More focused sampling
          topP: 0.85,       // More focused sampling
          maxOutputTokens: 800, // Shorter responses
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Invalid response format from Gemini API");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again.";
  }
};

/**
 * Create a structured prompt with context for better AI responses
 * @param {string} userPrompt - The user's input
 * @param {Object} context - Additional context
 * @returns {string} - The structured prompt
 */
const createStructuredPrompt = (userPrompt, context) => {
  const { claimState, policyDetails, conversationHistory, currentStep } = context;
  
  let systemPrompt = `You are ClaimGenie, an AI assistant specializing in health insurance claims. 
Your role is to help users file insurance claims by collecting necessary information in a conversational manner.
Be friendly, professional, and helpful. Explain insurance terms in simple language.

IMPORTANT GUIDELINES:
1. Ask only ONE question at a time - never ask multiple questions in a single message
2. Be very specific about what information you need from the user
3. Keep your responses concise and focused
4. If the user provides information that doesn't match what you asked for, gently redirect them
5. Never repeat the same question multiple times
6. Always acknowledge the user's input before asking for new information

IMPORTANT QUESTIONNAIRE ORDER:
1. Ask for customer name who wants claim
2. Ask for date when incident happened
3. Ask for what happened (medical condition)
4. Ask about treatment
5. Ask about treatment cost
6. Check the policy coverage
7. Ask hospital name, address
8. Ask doctor name and contact
9. Generate MD file for this claim

CURRENT STEP: ${currentStep || 'Unknown'}
`;

  // Rest of the function remains the same...

  // Add policy context if available
  if (policyDetails) {
    systemPrompt += `\nPolicy Information:
- Policy Number: ${policyDetails.policy_number || 'Unknown'}
- Coverage Details: ${JSON.stringify(policyDetails.coverage_details || {})}
- Exclusions: ${JSON.stringify(policyDetails.exclusions || [])}
`;
  }

  // Add current claim state context if available
  if (claimState) {
    systemPrompt += `\nCurrent Claim Information:
${Object.entries(claimState)
  .filter(([key, value]) => value && key !== 'summary')
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}
`;
  }

  // Add conversation history context
  if (conversationHistory && conversationHistory.length > 0) {
    systemPrompt += `\nRecent Conversation History:
${conversationHistory
  .slice(-5)
  .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
  .join('\n')}
`;
  }

  // Add the user's current prompt
  systemPrompt += `\nUser's current message: "${userPrompt}"

Please respond to the user's message in a helpful way. If you need to ask for specific information about their claim, do so one question at a time.
If you're providing a summary of the claim, format it clearly with markdown.

REMEMBER: Keep your response focused on exactly one question or acknowledgment. Never ask multiple questions in the same message.
`;

  return systemPrompt;
};

/**
 * Analyze a medical condition and treatment to estimate claim amount
 * @param {string} condition - The medical condition
 * @param {string} treatment - The treatment received
 * @param {Object} policyDetails - Policy details for coverage checking
 * @returns {Promise<Object>} - Estimated amount and explanation
 */
export const estimateClaimAmount = async (condition, treatment, policyDetails) => {
  try {
    const prompt = `As an insurance claim estimator with expertise in healthcare costs, analyze this medical scenario:
Condition: ${condition}
Treatment: ${treatment}

Based on typical insurance coverage and standard medical costs in the United States, estimate:
1. The approximate total cost of this treatment (be realistic and specific)
2. The estimated amount that would be covered by insurance (assume 80% coverage for in-network providers)
3. A brief explanation of how you arrived at this estimate

If the policy details show this is covered, use that information in your estimate.
Policy details: ${JSON.stringify(policyDetails || {})}

Format your response as a JSON object with these fields:
- totalCost: numeric estimate of total cost
- coveredAmount: numeric estimate of covered amount
- explanation: brief explanation of the estimate
`;

    const response = await generateGeminiResponse(prompt, {});
    
    // Try to parse the response as JSON
    try {
      // Extract JSON from the response if it's embedded in text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const result = JSON.parse(jsonStr);
        return {
          totalCost: parseFloat(result.totalCost) || 0,
          coveredAmount: parseFloat(result.coveredAmount) || 0,
          explanation: result.explanation || "No explanation provided"
        };
      }
    } catch (parseError) {
      console.error("Error parsing Gemini response as JSON:", parseError);
    }
    
    // Fallback to a default estimate if parsing fails
    return {
      totalCost: 1500.00,
      coveredAmount: 1200.00,
      explanation: "This is a default estimate as we couldn't generate a specific one."
    };
  } catch (error) {
    console.error("Error estimating claim amount:", error);
    return {
      totalCost: 1500.00,
      coveredAmount: 1200.00,
      explanation: "Default estimate due to estimation error."
    };
  }
};
