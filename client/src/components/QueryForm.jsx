import React, { useState } from 'react';

function QueryForm() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    fetch('http://localhost:8000/api/query/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ensures session data is sent
      body: JSON.stringify({ question }),
    })
      .then((res) => res.json())
      .then((data) => setAnswer(data.answer))
      .catch((error) => {
        console.error(error);
        setAnswer("Error retrieving answer.");
      });
  };

  return (
    <div>
      <h2>Ask a Question about Your Policy</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your question..."
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
      {answer && (
        <div>
          <h3>Answer:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default QueryForm;