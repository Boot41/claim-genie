import React, { useState } from 'react'
import { FaSpinner } from 'react-icons/fa'
import { toast } from 'react-toastify'

function QueryForm() {
  const [question, setQuestion] = useState("")
  const [conversationHistory, setConversationHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!question.trim()) {
      toast.error('Please enter a question.')
      return
    }

    // Create a new conversation entry with a placeholder for the answer
    const newEntry = {
      question: question,
      answer: "Fetching answer..."
    }

    // Append the new question to the conversation history and clear the input
    setConversationHistory(prev => [...prev, newEntry])
    setQuestion("")
    setIsLoading(true)

    fetch('http://localhost:8000/api/query/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ question })
    })
      .then((res) => res.json())
      .then((data) => {
        // Update the last entry in the conversation history with the fetched answer
        setConversationHistory(prev => {
          const updatedHistory = [...prev]
          updatedHistory[updatedHistory.length - 1] = {
            ...updatedHistory[updatedHistory.length - 1],
            answer: data.answer
          }
          return updatedHistory
        })
      })
      .catch((error) => {
        console.error(error)
        toast.error('Error retrieving answer.')
        // Update the last entry with an error message
        setConversationHistory(prev => {
          const updatedHistory = [...prev]
          updatedHistory[updatedHistory.length - 1] = {
            ...updatedHistory[updatedHistory.length - 1],
            answer: 'Error retrieving answer.'
          }
          return updatedHistory
        })
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Ask a Question about Your Policy</h2>

      {/* Conversation History */}
      <div className="max-h-80 overflow-y-auto mb-4 space-y-4">
        {conversationHistory.map((entry, index) => (
          <div key={index}>
            <div className="bg-blue-100 text-blue-800 p-3 rounded-md">
              <strong>Q:</strong> {entry.question}
            </div>
            <div className="bg-gray-100 text-gray-800 p-3 rounded-md mt-1">
              <strong>A:</strong> {entry.answer}
            </div>
          </div>
        ))}
      </div>

      {/* Query Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Enter your question..."
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          required
          className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="flex justify-center items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin" /> Submitting...
            </>
          ) : (
            "Submit"
          )}
        </button>
      </form>
    </div>
  )
}

export default QueryForm