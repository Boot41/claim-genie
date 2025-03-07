# ClaimGenie - AI-Powered Insurance Claims Platform

## Overview

ClaimGenie is a modern, AI-powered insurance claims management platform that simplifies the claim filing process through an intuitive chatbot interface and provides real-time claim status tracking. The application leverages Google's Gemini API to provide intelligent responses, estimate claim amounts, and analyze medical conditions and treatments.

## Features

- **AI-Powered Claim Chatbot**: Conversational interface for filing claims with intelligent responses
- **Real-time Policy Coverage Checking**: Instant verification of whether treatments are covered by the user's policy
- **Claim Amount Estimation**: AI-based estimation of claim amounts and total costs
- **Dynamic Claim Timeline**: Visual representation of claim processing status
- **Document Upload**: Support for uploading supporting documents via Cloudinary
- **Responsive Design**: Mobile-friendly interface for on-the-go claim management

## Technology Stack

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Django REST Framework
- **AI Integration**: Google Gemini API
- **Authentication**: JWT
- **File Storage**: Cloudinary

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Python 3.8+
- Google Gemini API key

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```
   cd client
   npm install
   ```
3. Install backend dependencies:
   ```
   cd server
   pip install -r requirements.txt
   ```
4. Configure the Gemini API:
   - Open `/client/src/utils/geminiApi.js`
   - Replace `YOUR_GEMINI_API_KEY` with your actual Gemini API key

### Running the Application

1. Start the backend server:
   ```
   cd server
   python manage.py runserver
   ```
2. Start the frontend development server:
   ```
   cd client
   npm run dev
   ```
3. Access the application at `http://localhost:5173`

## Gemini API Integration

ClaimGenie uses Google's Gemini API for several key features:

1. **Intelligent Chatbot Responses**: The chatbot provides contextually relevant responses based on the user's input and claim information.

2. **Claim Amount Estimation**: When a user submits a claim, the Gemini API analyzes the medical condition and treatment to estimate:
   - Total cost of the treatment
   - Amount likely to be covered by insurance
   - Explanation of the estimate

3. **Medical Condition Analysis**: The API helps analyze whether specific conditions and treatments are likely to be covered by the user's policy.

To customize the Gemini API integration:

- Modify prompts in `src/utils/geminiApi.js`
- Adjust temperature and other generation parameters for different response styles
- Add additional context to improve response quality
