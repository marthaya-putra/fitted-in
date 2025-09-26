import { useState } from "react";
import { actions } from "./actions";

function App() {
  const [jobDescription, setJobDescription] = useState("");

  const handleExtractJobDescription = () => {
    chrome.runtime.sendMessage(
      { action: actions.extractJobDescription },
      response => {
        console.log({ response });
        setJobDescription(response?.data || "");
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="mt-6">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleExtractJobDescription}
          >
            Click me 9
          </button>
        </div>
        <p>{jobDescription}</p>
      </div>
    </div>
  );
}

export default App;
