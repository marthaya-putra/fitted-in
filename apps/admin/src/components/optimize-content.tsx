"use client";

import { useState } from "react";
import { JobDescriptionForm } from "@/components/job-description-form";
import { StreamingMarkdownPreview } from "@/components/streaming-markdown-preview";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

interface JobDescriptionFormValues {
  jobDescription: string;
}

type OptimizationStatus = {
  stage: string;
  message: string;
  status: "in-progress" | "done";
};

const stages = [
  { id: "summarizing", label: "Analyzing Job Description" },
  { id: "summary", label: "Optimizing Summary" },
  { id: "experience", label: "Optimizing Experience" },
  { id: "skills", label: "Optimizing Skills" },
  { id: "formatting", label: "Formatting Resume" },
];

export function OptimizeContent() {
  const [optimizedContent, setOptimizedContent] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const router = useRouter();
  const [optimizationStatus, setOptimizationStatus] = useState<
    Array<OptimizationStatus>
  >([]);
  const [hasStartedStreaming, setHasStartedStreaming] = useState(false);

  const handleOptimize = async (data: JobDescriptionFormValues) => {
    setIsOptimizing(true);
    setOptimizedContent("");
    setOptimizationStatus([]);
    setHasStartedStreaming(false);

    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: data.jobDescription }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to optimize resume");
      }

      if (!response.body) {
        throw new Error("No response body from optimization endpoint");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              const parsed = JSON.parse(data);

              if (parsed.type === "data-status") {
                setOptimizationStatus((prev) => [...prev, parsed.data]);
              } else if (parsed.type === "text-delta") {
                setHasStartedStreaming(true);
                setOptimizedContent((prev) => prev + parsed.delta);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      setIsOptimizing(false);
      toast.success("Resume optimization completed!");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to optimize resume";

      setIsOptimizing(false);

      if (errorMessage.includes("User not logged in")) {
        toast.error("Please sign in to optimize your resume");
        router.push("/sign-in");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <>
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Resume Optimizer
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-[52px]">
          Paste a job description and get an AI-optimized resume tailored for the role
        </p>
      </div>

      {/* Main content — fixed height so columns scroll independently */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-14rem)]">
        {/* Left: Input */}
        <JobDescriptionForm
          onSubmit={handleOptimize}
          isLoading={isOptimizing}
        />

        {/* Right: Progress or Preview */}
        {isOptimizing && !hasStartedStreaming ? (
          <div className="rounded-xl border border-border/60 bg-card shadow-sm p-6">
            <h3 className="text-sm font-medium text-foreground mb-4">Optimization Progress</h3>
            <div className="space-y-2">
              {stages.map((stage) => {
                const isInProgress = optimizationStatus.some(
                  (s) => s.stage === stage.id && s.status === "in-progress"
                );
                const isDone = optimizationStatus.some(
                  (s) => s.stage === stage.id && s.status === "done"
                );

                return (
                  <div
                    key={stage.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isDone
                        ? "bg-emerald-50 text-emerald-700"
                        : isInProgress
                          ? "bg-primary/8 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full flex-shrink-0 transition-colors duration-300 ${
                        isDone
                          ? "bg-emerald-500"
                          : isInProgress
                            ? "bg-primary animate-pulse"
                            : "bg-muted-foreground/30"
                      }`}
                    />
                    <span className="text-sm font-medium">{stage.label}</span>
                    {isDone && (
                      <svg
                        className="ml-auto h-4 w-4 text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {isInProgress && (
                      <div className="ml-auto h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <StreamingMarkdownPreview
            content={optimizedContent}
            isLoading={isOptimizing}
          />
        )}
      </div>
    </>
  );
}
