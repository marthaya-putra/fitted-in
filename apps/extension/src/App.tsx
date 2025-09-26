import { useState } from "react";
import { actions } from "./actions";

function App() {
  // const [jobDescription, setJobDescription] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleExtractJobDescription = () => {
    chrome.runtime.sendMessage(
      { action: actions.extractJobDescription },
      response => {
        console.log({ response });
        // setJobDescription(response?.data || "");
      }
    );
  };

  const handleCopyToClipboard = async () => {
    const content = document.getElementById('content-to-copy');
    if (content) {
      try {
        const htmlContent = content.innerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': blob,
            'text/plain': new Blob([content.textContent || ''], { type: 'text/plain' })
          })
        ]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy content: ', err);
      }
    }
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
        <div className="mt-4 p-4 bg-white rounded border">
          <div id="content-to-copy">
            <h1>Title</h1>
            <p>
              Hello, <strong>Bro!</strong>
            </p>
          </div>
          <button
            onClick={handleCopyToClipboard}
            className={`mt-3 px-3 py-1 text-sm rounded ${
              isCopied
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
