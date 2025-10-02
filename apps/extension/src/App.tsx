import { useState } from "react";
import { actions } from "./actions";
import { ResumePreview } from "./resume-preview";

function App() {
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOptimizeCV = () => {
    setLoading(true);
    chrome.runtime.sendMessage({ action: actions.optimizeResume }, response => {
      console.log({ response });
      setResume(response?.data || "");
      setLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="mt-6">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleOptimizeCV}
          >
            {loading ? `Optimizing` : `Optimize My CV for this job`}
          </button>
        </div>
        {/* <div className="mt-4 p-4 bg-white rounded border">
          <div
            id="content-to-copy"
            dangerouslySetInnerHTML={{ __html: resume }}
          ></div>
          <button
            onClick={handleCopyToClipboard}
            className={`mt-3 px-3 py-1 text-sm rounded ${
              isCopied
                ? "bg-green-500 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            {isCopied ? "Copied!" : "Copy"}
          </button>
        </div> */}
        <ResumePreview markdown={resume} />
      </div>
    </div>
  );
}

export default App;
