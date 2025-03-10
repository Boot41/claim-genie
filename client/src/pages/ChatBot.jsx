import React from 'react'
import FileUpload from '../components/FileUpload'
import QueryForm from '../components/QueryForm'

const ChatBot = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Health Policy Chatbot
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <FileUpload />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <QueryForm />
      </div>
    </div>
  )
}

export default ChatBot