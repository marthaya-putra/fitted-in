import { useEffect, useState, useRef } from "react";
import { actions, ActionType } from "./types";
import { ResumePreview } from "./resume-preview";
import { LoginForm } from "./login-form";
import { LoadingScreen } from "./loading-screen";
import { authClient } from "./auth";
import {
  Briefcase,
  Sparkles,
  AlertCircle,
  Loader2,
  LogOut,
  ChevronDown,
  Check,
  Circle,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";

type OptimizationStatus = {
  stage: string;
  message: string;
  status: "in-progress" | "done";
};

function App() {
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentJobTitle, setCurrentJobTitle] = useState("");
  const [error, setError] = useState("");
  const [isOptimized, setIsOptimized] = useState(false);
  const [optimizationStatus, setOptimizationStatus] = useState<
    Array<OptimizationStatus>
  >([]);
  const [hasStartedStreaming, setHasStartedStreaming] = useState(false);

  const { data: session, isPending } = authClient.useSession();

  // Store port ref to avoid reconnecting
  const portRef = useRef<chrome.runtime.Port | null>(null);

  useEffect(() => {
    // Prevent duplicate connections
    if (portRef.current) {
      console.log("App: Port already exists, skipping connection");
      return;
    }

    console.log("App: useEffect - Connecting to background with port name 'sidepanel'");
    const port = chrome.runtime.connect({ name: "sidepanel" });
    portRef.current = port;
    console.log("App: Port connected:", port);

    const messageHandler = (msg: {
      action: ActionType;
      data: string | OptimizationStatus;
    }) => {
      console.log("App port message received: ", msg.action, msg.data);
      if (msg.action === actions.updateJobTitle) {
        setCurrentJobTitle(msg.data as string);
        setResume("");
        setError("");
        setIsOptimized(false);
        setOptimizationStatus([]);
        setHasStartedStreaming(false);
      }
      if (msg.action === actions.streaming) {
        setHasStartedStreaming(true);
        setResume(prev => prev + (msg.data as string));
        return;
      }

      if (msg.action === actions.streamingEnded) {
        setLoading(false);
        setIsOptimized(true);
        return;
      }

      if (msg.action === actions.optimizationStatus) {
        const statusData = msg.data as OptimizationStatus;
        setOptimizationStatus(prev => [...prev, statusData]);

        return;
      }
    };

    port.onMessage.addListener(messageHandler);
    console.log("App: Message listener added to port");

    return () => {
      console.log("App: Cleanup - removing listener and disconnecting port");
      port.onMessage.removeListener(messageHandler);
      port.disconnect();
      portRef.current = null;
    };
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  const handleLoginSuccess = () => {
    window.location.reload();
  };

  const handleOptimizeCV = () => {
    setResume("");
    setError("");
    setLoading(true);
    setIsOptimized(false);
    setOptimizationStatus([]);
    setHasStartedStreaming(false);

    chrome.runtime.sendMessage({ action: actions.optimizeResume }, response => {
      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }
    });
  };

  if (isPending) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <LoginForm onSuccess={handleLoginSuccess} />;
  }

  const userLabel = session.user.name || session.user.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-accent relative">
      <div className="p-4 flex flex-col gap-4 h-[calc(100vh-8rem)]">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent rounded-lg">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">
              {currentJobTitle || "Select position to optimize"}
            </h1>
          </div>
        </div>

        <div>
          <button
            onClick={handleOptimizeCV}
            disabled={loading || !currentJobTitle}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              loading || !currentJobTitle
                ? "bg-primary text-primary-foreground cursor-not-allowed opacity-90"
                : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg"
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

        {loading && !hasStartedStreaming && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-1">
            <div className="space-y-3">
              {[
                { id: "summarizing", label: "Summarizing Job Description" },
                { id: "summary", label: "Optimizing Your Summary" },
                { id: "skills", label: "Optimizing Your Skills" },
                { id: "experience", label: "Optimizing Your Experience" },
                { id: "formatting", label: "Formatting Resume" },
              ].map(stage => {
                const isInProgress = optimizationStatus.some(
                  s => s.stage === stage.id && s.status === "in-progress"
                );
                const isDone = optimizationStatus.some(
                  s => s.stage === stage.id && s.status === "done"
                );

                return (
                  <div
                    key={stage.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isDone
                        ? "bg-green-50 border-green-200"
                        : isInProgress
                          ? "bg-accent border-primary"
                          : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isDone
                          ? "bg-green-500"
                          : isInProgress
                            ? "bg-primary"
                            : "bg-gray-300"
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : isInProgress ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <Circle className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <span
                      className={`font-medium ${
                        isDone
                          ? "text-green-700"
                          : isInProgress
                            ? "text-primary"
                            : "text-gray-500"
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
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

      {session && (
        <div className="fixed bottom-2 right-2 z-50">
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className="flex items-center gap-1 p-1.5 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/90 rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold text-sm">
                    {userLabel[0]?.toUpperCase()}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                align="end"
                side="top"
                sideOffset={10}
                className="bg-white rounded-lg shadow-xl border border-gray-200 p-1 min-w-[200px] z-50"
              >
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {session.user.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session.user.name || "User"}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
                <Popover.Arrow className="fill-gray-200" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      )}
    </div>
  );
}

export default App;
