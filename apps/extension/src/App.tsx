import { useState, useEffect } from 'react'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    setMessage('Welcome to fitted-in extension!')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <p className="text-gray-600">{message}</p>
        <div className="mt-6">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setMessage('Button clicked!')}
          >
            Click me
          </button>
        </div>
      </div>
    </div>
  )
}

export default App