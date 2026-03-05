"use client";

import { useState } from "react";
import { JobDescriptionForm } from "@/components/job-description-form";
import { StreamingMarkdownPreview } from "@/components/streaming-markdown-preview";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Circle, Check } from "lucide-react";

interface JobDescriptionFormValues {
  jobDescription: string;
}

type OptimizationStatus = {
  stage: string;
  message: string;
  status: "in-progress" | "done";
};

export default function OptimizePage() {
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
      const response = await fetch("/_internal/optimize", {
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
          console.log("Stream read:", { done, valueLength: value?.length });
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
                setOptimizationStatus(prev => [...prev, parsed.data]);
              } else if (parsed.type === "text-delta") {
                setHasStartedStreaming(true);
                setOptimizedContent(prev => prev + parsed.delta);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      console.log("Stream completed, setting isOptimizing to false");
      setIsOptimizing(false);
      toast.success("Resume optimization completed!");
    } catch (error) {
      console.error("Optimization error:", error);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-accent">
      <div className="container mx-auto px-4 py-8 h-full">
        <div className="h-full flex flex-col space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary">
                Resume Optimizer
              </h1>
              <p className="text-muted-foreground mt-2">
                Optimize your resume for specific job descriptions using AI
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Input Form */}
            <div className="h-full">
              <JobDescriptionForm
                onSubmit={handleOptimize}
                isLoading={isOptimizing}
              />
            </div>

            {/* Right Column - Progress Indicators or Streaming Output */}
            <div className="h-full">
              {isOptimizing && !hasStartedStreaming ? (
                <div className="h-full rounded-lg border border-primary/20 bg-card p-6">
                  <div className="space-y-3">
                    {[
                      { id: "summarizing", label: "Summarizing Job Description" },
                      { id: "summary", label: "Optimizing Your Summary" },
                      { id: "experience", label: "Optimizing Your Experience" },
                      { id: "skills", label: "Optimizing Your Skills" },
                      { id: "formatting", label: "Formatting Resume" },
                    ].map((stage) => {
                      const isInProgress = optimizationStatus.some(
                        (s) => s.stage === stage.id && s.status === "in-progress"
                      );
                      const isDone = optimizationStatus.some(
                        (s) => s.stage === stage.id && s.status === "done"
                      );

                      return (
                        <div
                          key={stage.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            isDone
                              ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                              : isInProgress
                                ? "bg-accent border-primary dark:bg-primary/20 dark:border-primary/40"
                                : "bg-muted border-muted-foreground/20"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isDone
                                ? "bg-green-500"
                                : isInProgress
                                  ? "bg-primary"
                                  : "bg-muted-foreground/30"
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
                            className={`font-medium text-sm ${
                              isDone
                                ? "text-green-700 dark:text-green-400"
                                : isInProgress
                                  ? "text-primary"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {stage.label}
                          </span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
