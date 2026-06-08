import { useEffect, useState, useRef } from "react";
import { actions, ActionType } from "./types";
import { ResumePreview } from "./resume-preview";
import { LoginForm } from "./login-form";
import { LoadingScreen } from "./loading-screen";
import { ProgressStepper } from "./components/progress-stepper";
import { EmptyState, EmptyNoJob } from "./components/empty-state";
import { UserMenu } from "./components/user-menu";
import { ErrorAlert } from "./components/error-alert";
import { authClient } from "./auth";
import {
  Briefcase,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Toaster } from "sonner";

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

  // Generate unique ID for this sidepanel instance
  const instanceId = useRef(Math.random().toString(36).substring(7));
  console.log("=== SIDE PANEL INSTANCE CREATED:", instanceId.current, "===");

  // Track port connection to prevent duplicate listeners
  const portRef = useRef<chrome.runtime.Port | null>(null);

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    const messageHandler = (msg: {
      action: ActionType;
      data: string | OptimizationStatus;
    }) => {
      console.log(
        `[Instance ${instanceId.current}] App port message received: `,
        msg.action,
        msg.data
      );
      if (msg.action === actions.updateJobTitle) {
        const jobTitle = (msg.data as string).trim();
        console.log(
          `[Instance ${instanceId.current}] Updating job title to:`,
          jobTitle
        );

        setCurrentJobTitle(jobTitle);
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

    function connect() {
      const port = chrome.runtime.connect({ name: "sidepanel" });
      portRef.current = port;
      console.log(`[Instance ${instanceId.current}] Port connected:`, port);

      port.onMessage.addListener(messageHandler);

      port.onDisconnect.addListener(() => {
        portRef.current = null;
        console.log(
          `[Instance ${instanceId.current}] Sidepanel port disconnected, reconnecting...`
        );
        setTimeout(connect, 1000);
      });
    }

    connect();

    return () => {
      if (portRef.current) {
        portRef.current.disconnect();
        portRef.current = null;
      }
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

  if (isPending) return <LoadingScreen />;
  if (!session) return <LoginForm onSuccess={handleLoginSuccess} />;

  const userLabel = session.user.name || session.user.email;

  return (
    <div className="h-screen flex flex-col bg-background">
      <Toaster />

      {/* ===== HEADER ZONE ===== */}
      <header className="flex-shrink-0 h-[var(--header-height)] px-4 flex items-center gap-3 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
          <Briefcase className="w-4 h-4 text-primary" />
        </div>
        <h1 className="text-[15px] font-semibold text-foreground leading-tight truncate">
          {currentJobTitle || "Select position to optimize"}
        </h1>
      </header>

      {/* ===== CONTENT ZONE (scrollable) ===== */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 flex flex-col gap-4">
          {/* Error */}
          {error && (
            <div className="animate-slide-in-up">
              <ErrorAlert message={error} onDismiss={() => setError("")} />
            </div>
          )}

          {/* Progress stepper */}
          {loading && !hasStartedStreaming && (
            <div className="animate-fade-in">
              <ProgressStepper statusItems={optimizationStatus} />
            </div>
          )}

          {/* Resume result */}
          {resume && (
            <div className="animate-slide-in">
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <ResumePreview markdown={resume} canCopy={isOptimized} />
              </div>
            </div>
          )}

          {/* Empty: job selected, ready to optimize */}
          {!resume && !loading && currentJobTitle && (
            <div className="animate-fade-in">
              <EmptyState />
            </div>
          )}

          {/* Empty: no job on page */}
          {!currentJobTitle && !loading && (
            <div className="animate-fade-in">
              <EmptyNoJob />
            </div>
          )}
        </div>
      </main>

      {/* ===== ACTION ZONE ===== */}
      <div className="flex-shrink-0 px-4 pb-2 pt-3 bg-background border-t border-border/50">
        <button
          onClick={handleOptimizeCV}
          disabled={loading || !currentJobTitle}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm btn-press transition-colors duration-150 ${
            loading || !currentJobTitle
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:shadow-none"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Optimizing your CV...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Optimize My CV for this Job</span>
            </>
          )}
        </button>

        {!currentJobTitle && (
          <p className="text-[11px] text-muted-foreground text-center mt-1.5 tracking-wide">
            Navigate to a job posting to enable optimization
          </p>
        )}
      </div>

      {/* ===== FOOTER ZONE ===== */}
      <footer className="flex-shrink-0 h-[var(--footer-height)] px-4 flex items-center justify-end border-t border-border">
        <UserMenu
          userLabel={userLabel}
          email={session.user.email}
          name={session.user.name}
          onSignOut={handleSignOut}
        />
      </footer>
    </div>
  );
}

export default App;
