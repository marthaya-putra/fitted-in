"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Download, Loader2 } from "lucide-react";
import remarkBreaks from "remark-breaks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StickToBottom } from "use-stick-to-bottom";
import { toast } from "sonner";

interface StreamingMarkdownPreviewProps {
  content: string;
  isLoading?: boolean;
  className?: string;
}

export function StreamingMarkdownPreview({
  content,
  isLoading = false,
  className,
}: StreamingMarkdownPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const htmlRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    if (htmlRef.current) {
      const htmlContent = htmlRef.current.innerHTML;
      const blob = new Blob([htmlContent], { type: "text/html" });
      const clipboardItem = new ClipboardItem({ "text/html": blob });

      await navigator.clipboard.write([clipboardItem]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch("/api/resumes/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: content }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();

      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
          suggestedName: "resume.pdf",
          types: [{ description: "PDF", accept: { "application/pdf": [".pdf"] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "resume.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      toast.error("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    // Ensure this wrapper has a constrained height so inner container can scroll.
    <div className={cn("relative h-full max-h-[600px]", className)}>
      <div className="absolute top-0 right-4 z-10 -translate-y-1/2 flex gap-2">
        <Button
          onClick={handleDownloadPdf}
          variant="outline"
          size="sm"
          disabled={!content || isLoading || isDownloading}
          className="gap-2 transition-all duration-200"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </>
          )}
        </Button>
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          disabled={!content || isLoading}
          className={cn(
            "gap-2 transition-all duration-200",
            copied &&
              "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          )}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Give this a constrained height (fills parent max-h) and let StickToBottom handle scrolling */}
      <div className="h-full rounded-lg border bg-card">
        <StickToBottom
          className="h-full overflow-y-auto"
          resize="smooth"
          initial="smooth"
        >
          <StickToBottom.Content className="p-6">
            {content ? (
              <div
                ref={htmlRef}
                className="prose prose-sm max-w-none prose-gray dark:prose-invert"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkBreaks]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold text-foreground mb-4">
                        {" "}
                        {children}{" "}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-semibold text-foreground mb-3 mt-6">
                        {" "}
                        {children}{" "}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-semibold text-foreground mb-2 mt-4">
                        {" "}
                        {children}{" "}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {" "}
                        {children}{" "}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="text-sm text-muted-foreground mb-3 space-y-1 list-disc list-inside">
                        {" "}
                        {children}{" "}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="text-sm text-muted-foreground mb-3 space-y-1 list-decimal list-inside">
                        {" "}
                        {children}{" "}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-muted-foreground">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">
                        {" "}
                        {children}{" "}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-muted-foreground">
                        {children}
                      </em>
                    ),
                    hr: () => <hr className="my-6 border-border" />,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                {isLoading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-sm">Optimizing your resume...</p>
                  </div>
                ) : (
                  <p className="text-sm">
                    Your optimized resume will appear here
                  </p>
                )}
              </div>
            )}
          </StickToBottom.Content>
        </StickToBottom>
      </div>
    </div>
  );
}
