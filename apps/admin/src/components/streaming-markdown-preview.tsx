"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Download, Loader2, FileText } from "lucide-react";
import remarkBreaks from "remark-breaks";
import { Button } from "@/components/ui/button";
import { cn } from 'cnfast';
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
    let writable: FileSystemWritableFileStream | null = null;

    try {
      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
          suggestedName: "resume.pdf",
          types: [{ description: "PDF", accept: { "application/pdf": [".pdf"] } }],
        });
        writable = await handle.createWritable();
      }

      const res = await fetch("/api/resumes/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: content }),
      });
      if (!res.ok) throw new Error("Failed to enqueue PDF generation");

      const { data } = (await res.json()) as { data: { id: string; statusToken: string } };
      const { id, statusToken } = data;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

      await new Promise<void>((resolve, reject) => {
        const es = new EventSource(`${apiUrl}/api/resumes/pdf/status/${id}?token=${statusToken}`);

        es.onmessage = async (event) => {
          try {
            const { status, signedUrl, errorMessage } = JSON.parse(event.data) as {
              status: string;
              signedUrl?: string;
              errorMessage?: string;
            };

            if (status === "completed" && signedUrl) {
              es.close();

              const blobRes = await fetch(signedUrl);
              const blob = await blobRes.blob();

              if (writable) {
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

              resolve();
            } else if (status === "failed") {
              es.close();
              reject(new Error(errorMessage ?? "PDF generation failed"));
            }
          } catch (err) {
            es.close();
            reject(err);
          }
        };

        es.onerror = () => {
          es.close();
          reject(new Error("Connection lost while generating PDF"));
        };
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      toast.error(err instanceof Error ? err.message : "Failed to download PDF");
    } finally {
      await writable?.abort();
      setIsDownloading(false);
    }
  };

  return (
    <div className={cn("flex flex-col rounded-xl border border-border/60 bg-card shadow-sm h-full overflow-hidden", className)}>
      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 flex-shrink-0">
        <h3 className="text-sm font-medium text-foreground">
          {content ? "Optimized Resume" : "Preview"}
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={handleDownloadPdf}
            variant="ghost"
            size="sm"
            disabled={!content || isLoading || isDownloading}
            className="h-8 gap-1.5 text-muted-foreground"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-xs">Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span className="text-xs">PDF</span>
              </>
            )}
          </Button>
          <Button
            onClick={handleCopy}
            variant="ghost"
            size="sm"
            disabled={!content || isLoading}
            className={cn(
              "h-8 gap-1.5",
              copied && "text-emerald-600 hover:text-emerald-700"
            )}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="text-xs">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-xs">Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <StickToBottom
          className="h-full overflow-y-auto"
          resize="smooth"
          initial="smooth"
        >
          <StickToBottom.Content className="p-6">
            {content ? (
              <div
                ref={htmlRef}
                className="prose prose-sm max-w-none prose-gray"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkBreaks]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold text-foreground mb-4">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-semibold text-foreground mb-3 mt-6">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-semibold text-foreground mb-2 mt-4">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="text-sm text-muted-foreground mb-3 space-y-1 list-disc list-inside">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="text-sm text-muted-foreground mb-3 space-y-1 list-decimal list-inside">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-muted-foreground">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">
                        {children}
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
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                {isLoading ? (
                  <>
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-4" />
                    <p className="text-sm">Optimizing your resume...</p>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm">
                      Your optimized resume will appear here
                    </p>
                  </>
                )}
              </div>
            )}
          </StickToBottom.Content>
        </StickToBottom>
      </div>
    </div>
  );
}
