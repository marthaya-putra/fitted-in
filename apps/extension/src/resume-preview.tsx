import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Download, Loader2 } from "lucide-react";
import { StickToBottom } from "use-stick-to-bottom";
import { toast } from "sonner";
import remarkBreaks from "remark-breaks";

export const ResumePreview = ({
  markdown,
  canCopy,
}: {
  markdown: string;
  canCopy: boolean;
}) => {
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
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const res = await fetch(`${backendUrl}/api/resumes/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown }),
      });
      if (!res.ok) throw new Error("Failed to enqueue PDF generation");

      const { data } = (await res.json()) as { data: { id: string; statusToken: string } };
      const { id, statusToken } = data;

      await new Promise<void>((resolve, reject) => {
        const es = new EventSource(`${backendUrl}/api/resumes/pdf/status/${id}?token=${statusToken}`);

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
              const url = URL.createObjectURL(blob);
              await chrome.downloads.download({
                url,
                filename: "resume.pdf",
                saveAs: true,
              });
              URL.revokeObjectURL(url);
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
      toast.error(err instanceof Error ? err.message : "Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative">
      {/* Sticky action bar inside the card */}
      {canCopy && (
        <div className="sticky top-0 z-10 flex items-center justify-end gap-2 px-4 py-2 bg-gradient-to-b from-card via-card/95 to-card/80 animate-fade-in">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors duration-150 bg-muted text-muted-foreground hover:bg-muted/80 border border-border hover:border-border/80 btn-press disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <Download className="w-3 h-3" />
            )}
          </button>

          <button
            onClick={handleCopy}
            className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors duration-150 border btn-press ${
              copied
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}
            aria-label={copied ? "Copied" : "Copy resume"}
          >
            {/* Crossfade Copy → Check on success (feedback, ~13px: opacity swap, no blur needed). */}
            <Copy
              className={`w-3 h-3 transition-opacity duration-150 ${
                copied ? "opacity-0" : "opacity-100"
              }`}
            />
            <Check
              className={`absolute left-2.5 w-3 h-3 transition-opacity duration-150 ${
                copied ? "opacity-100" : "opacity-0"
              }`}
            />
          </button>
        </div>
      )}

      {/* Resume content — fills available space, no magic height */}
      <StickToBottom
        className="w-full h-[calc(100vh-12rem)] overflow-y-auto"
        resize="smooth"
        initial="smooth"
      >
        <StickToBottom.Content>
          <div ref={htmlRef} className="prose prose-sm max-w-none p-4">
            <ReactMarkdown
              remarkPlugins={[remarkBreaks]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-[15px] font-bold text-foreground mb-1">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-sm font-semibold text-foreground mb-1 mt-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-[13px] font-semibold text-foreground mb-1 mt-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-[13px] text-muted-foreground mb-1.5 leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="text-[13px] text-muted-foreground mb-1.5 space-y-0.5 list-disc list-inside">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="text-[13px] text-muted-foreground mb-1.5 space-y-0.5 list-decimal list-inside">
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
                  <em className="italic text-muted-foreground">{children}</em>
                ),
                hr: () => <hr className="my-3 border-border" />,
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </StickToBottom.Content>
      </StickToBottom>
    </div>
  );
};
