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

// === Per-job resume persistence (chrome.storage.local) ===
// The generated resume previously lived only in React state, so any
// updateJobTitle re-broadcast (SW death/reconnect, tab focus, URL change,
// LinkedIn SPA nav) wiped it with nothing to restore from. We now keep a map
// of { jobTitle: resume } in chrome.storage.local so a resume is never lost.
const RESUMES_STORAGE_KEY = "fittedin:resumes";

// Validate the stored map shape so a corrupted/garbage value doesn't propagate
// as an unsafe cast — fall back to an empty map instead.
function asResumesMap(value: unknown): Record<string, string> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, string>;
  }
  return {};
}

async function loadResumes(): Promise<Record<string, string>> {
  try {
    const result = await chrome.storage.local.get(RESUMES_STORAGE_KEY);
    return asResumesMap(result[RESUMES_STORAGE_KEY]);
  } catch (err) {
    console.error("Failed to load resumes from storage:", err);
    return {};
  }
}

// Serialize writes through a queue. Each save is a load-modify-write of the
// whole map; without serialization, a streamingEnded save (current job) and a
// near-simultaneous switch-away save (previous job) could each read a stale
// map and clobber the other's key, losing a just-generated resume.
let saveChain: Promise<void> = Promise.resolve();
function saveResumeForJob(title: string, resume: string): Promise<void> {
  if (!title) return Promise.resolve();
  const run = saveChain.then(async () => {
    try {
      const all = await loadResumes();
      all[title] = resume;
      await chrome.storage.local.set({ [RESUMES_STORAGE_KEY]: all });
    } catch (err) {
      console.error("Failed to save resume to storage:", err);
    }
  });
  // Keep the chain alive even if one write rejects, but never let a rejected
  // promise escape to callers (they use `void`).
  saveChain = run.catch(() => {});
  return run;
}

async function getResumeForJob(title: string): Promise<string | undefined> {
  if (!title) return undefined;
  const all = await loadResumes();
  return all[title];
}

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

  // Refs mirror state so the message handler (which closes over stale values)
  // always reads the latest resume / job title when deciding whether to
  // restore, no-op, or persist.
  const resumeRef = useRef("");
  const currentJobTitleRef = useRef("");

  const setResumeSync = (next: string) => {
    resumeRef.current = next;
    setResume(next);
  };
  const setCurrentJobTitleSync = (next: string) => {
    currentJobTitleRef.current = next;
    setCurrentJobTitle(next);
  };

  const { data: session, isPending } = authClient.useSession();

  // Close/reopen restore: on a fresh sidepanel mount currentJobTitleRef is "",
  // so there's nothing to hydrate here directly. The restore is driven by the
  // background's reconnect-triggered updateJobTitle broadcast, whose handler
  // calls getResumeForJob for the active title — see the updateJobTitle branch
  // below.

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
        // Harden the payload: the content script returns { data: null } when
        // no company/position is found. Coerce non-strings to "" to avoid
        // `(null).trim()` crashing.
        const incoming =
          typeof msg.data === "string" ? msg.data.trim() : "";
        const jobTitle = incoming;

        // No-op on unchanged title: the background re-broadcasts updateJobTitle
        // on routine events (SW death + port reconnect, tab focus, URL change,
        // LinkedIn SPA nav) that fire with no user action. Treating an
        // unchanged title as a no-op prevents those races from wiping a
        // generated resume.
        if (jobTitle === currentJobTitleRef.current) {
          console.log(
            `[Instance ${instanceId.current}] Job title unchanged ("${jobTitle}"), skipping reset`
          );
          return;
        }

        // Per-job "hide but keep": before switching away from the current job,
        // persist its resume under its title so it is never lost.
        const prevTitle = currentJobTitleRef.current;
        const prevResume = resumeRef.current;
        if (prevTitle && prevResume) {
          void saveResumeForJob(prevTitle, prevResume);
        }

        console.log(
          `[Instance ${instanceId.current}] Updating job title to:`,
          jobTitle
        );

        // Reset view state for the new (possibly blank) job.
        setCurrentJobTitleSync(jobTitle);
        setResumeSync("");
        setError("");
        setIsOptimized(false);
        setOptimizationStatus([]);
        setHasStartedStreaming(false);

        // Restore the new job's previously saved resume, if any. Guard so a
        // later navigation that wins the race doesn't apply a stale restore.
        if (jobTitle) {
          void getResumeForJob(jobTitle).then(saved => {
            if (saved && currentJobTitleRef.current === jobTitle) {
              setResumeSync(saved);
              setIsOptimized(true);
            }
          });
        }
        return;
      }
      if (msg.action === actions.streaming) {
        setHasStartedStreaming(true);
        const chunk = msg.data as string;
        // Keep resumeRef in sync so streamingEnded persists the full text.
        resumeRef.current += chunk;
        setResume(prev => prev + chunk);
        return;
      }

      if (msg.action === actions.streamingEnded) {
        setLoading(false);
        setIsOptimized(true);
        // Durability: persist the completed resume under its job title so a
        // sidepanel close/reopen (or later re-broadcast cycle) restores it.
        const title = currentJobTitleRef.current;
        if (title && resumeRef.current) {
          void saveResumeForJob(title, resumeRef.current);
        }
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
    setResumeSync("");
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
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-b from-primary/15 to-primary/5 ring-1 ring-primary/10">
          <Briefcase className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${
                currentJobTitle && !loading
                  ? "bg-green-500"
                  : "bg-muted-foreground/30"
              }`}
            />
            <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
              {currentJobTitle ? "Target position" : "No position"}
            </span>
          </div>
          <h1 className="text-[15px] font-semibold text-foreground leading-tight line-clamp-2">
            {currentJobTitle || "Select a position to optimize"}
          </h1>
        </div>
      </header>

      {/* ===== CONTENT ZONE (scrollable) ===== */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 flex flex-col gap-4 h-full">
          {/* Error */}
          {error && (
            <div className="animate-slide-in-up">
              <ErrorAlert message={error} onDismiss={() => setError("")} />
            </div>
          )}

          {/* Progress stepper — fills the content zone while optimizing. */}
          {loading && !hasStartedStreaming && (
            <div className="animate-fade-in flex-1 min-h-0">
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
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm btn-press ${
            loading || !currentJobTitle
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md transition-colors duration-150"
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
