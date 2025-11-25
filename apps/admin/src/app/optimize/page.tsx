"use client";

import { useState, useTransition } from "react";
import { JobDescriptionForm } from "@/components/job-description-form";
import { StreamingMarkdownPreview } from "@/components/streaming-markdown-preview";
import { optimizeResume } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface JobDescriptionFormValues {
  jobDescription: string;
}

export default function OptimizePage() {
  const [optimizedContent, setOptimizedContent] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleOptimize = async (data: JobDescriptionFormValues) => {
    setIsOptimizing(true);
    setOptimizedContent("");

    try {
      startTransition(async () => {
        try {
          const stream = await optimizeResume(data.jobDescription);

          const reader = stream.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            setOptimizedContent(prev => prev + chunk);
          }

          toast.success("Resume optimization completed!");
        } catch (error) {
          console.error("Optimization error:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to optimize resume";

          if (errorMessage.includes("User not logged in")) {
            toast.error("Please sign in to optimize your resume");
            router.push("/sign-in");
          } else {
            toast.error(errorMessage);
          }
        } finally {
          setIsOptimizing(false);
        }
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
      setIsOptimizing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 h-full">
      <div className="h-full flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
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
              isLoading={isOptimizing || isPending}
            />
          </div>

          {/* Right Column - Streaming Output */}
          <div className="h-full">
            <StreamingMarkdownPreview
              content={optimizedContent}
              isLoading={isOptimizing || isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
