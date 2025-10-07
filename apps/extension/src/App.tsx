import { useEffect, useState } from "react";
import { actions, ActionType } from "./types";
import { ResumePreview } from "./resume-preview";
import { Briefcase, Sparkles, AlertCircle, Loader2 } from "lucide-react";

function App() {
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentJobTitle, setCurrentJobTitle] = useState("");
  const [error, setError] = useState("");
  const [isOptimized, setIsOptimized] = useState(false);

  useEffect(() => {
    const port = chrome.runtime.connect({ name: "sidepanel" });

    return () => {
      port.disconnect();
    };
  }, []);

  useEffect(() => {
    const handler = (msg: { action: ActionType; data: string }) => {
      if (msg.action === actions.updateJobTitle) {
        setCurrentJobTitle(msg.data);
        setResume("");
        setError("");
        setIsOptimized(false);
      }
      if (msg.action === "streaming") {
        setResume(prev => prev + msg.data);
        return;
      }

      if (msg.action === "streaming-ended") {
        setLoading(false);
        setIsOptimized(true);
        return;
      }
    };

    chrome.runtime.onMessage.addListener(handler);

    return () => {
      chrome.runtime.onMessage.removeListener(handler);
    };
  }, []);

  const handleOptimizeCV = () => {
    setResume("");
    setError("");
    setLoading(true);
    setIsOptimized(false);

    chrome.runtime.sendMessage({ action: actions.optimizeResume }, response => {
      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              {currentJobTitle || "Select position to optimize"}
            </h1>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={handleOptimizeCV}
            disabled={loading || !currentJobTitle}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              loading || !currentJobTitle
                ? "bg-blue-500 text-white cursor-not-allowed opacity-90"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Optimizing your CV...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Optimize My CV for this Job</span>
              </>
            )}
          </button>

          {!currentJobTitle && (
            <p className="mt-2 text-sm text-gray-500 text-center">
              Navigate to a job posting to enable optimization
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {resume && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <ResumePreview markdown={resume} canCopy={isOptimized} />
          </div>
        )}
        {!resume && !loading && currentJobTitle && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm">
              Click "Optimize My CV" to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
