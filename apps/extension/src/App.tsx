import { useEffect, useState } from "react";
import { actions, ActionType } from "./actions";
import { ResumePreview } from "./resume-preview";
import {
  Briefcase,
  Sparkles,
  AlertCircle,
  CheckCircle,
  User,
} from "lucide-react";

function App() {
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentJobTitle, setCurrentJobTitle] = useState("");
  const [error, setError] = useState("");
  const [isOptimized, setIsOptimized] = useState(false);

  useEffect(() => {
    chrome.runtime.sendMessage({ action: actions.sidePanelReady });
  }, []);

  useEffect(() => {
    const handler = (msg: { action: ActionType; data: any }) => {
      if (
        msg.action === actions.updateJobTitle &&
        typeof msg.data === "string"
      ) {
        setCurrentJobTitle(msg.data);
        setResume("");
        setError("");
        setIsOptimized(false);
      }
    };

    chrome.runtime.onMessage.addListener(handler);

    return () => {
      chrome.runtime.onMessage.removeListener(handler);
    };
  }, []);

  const handleOptimizeCV = () => {
    setError("");
    setLoading(true);
    setIsOptimized(false);

    chrome.runtime.sendMessage({ action: actions.optimizeResume }, response => {
      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }
      setResume(response?.data || "");
      setLoading(false);
      setIsOptimized(true);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Let's fit you right in!
            </h1>
          </div>

          {currentJobTitle && (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Target Position
                  </p>
                  <p className="text-gray-700">{currentJobTitle}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Action Button */}
        <div className="mb-6">
          <button
            onClick={handleOptimizeCV}
            disabled={loading || !currentJobTitle}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              loading || !currentJobTitle
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {isOptimized && resume && !error && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">
                CV Optimized Successfully!
              </p>
              <p className="text-sm text-green-700 mt-1">
                Your CV has been tailored for this position. Copy it to your
                clipboard.
              </p>
            </div>
          </div>
        )}

        {/* Resume Preview */}
        {resume && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">
                  Optimized CV
                </h2>
              </div>
            </div>
            <div className="p-4">
              <ResumePreview markdown={resume} />
            </div>
          </div>
        )}

        {/* Empty State */}
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
