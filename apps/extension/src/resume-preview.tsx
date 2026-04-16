import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, FileText, Loader2 } from "lucide-react";
import { StickToBottom } from "use-stick-to-bottom";
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
      const response = await fetch(`${backendUrl}/api/resumes/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      await chrome.downloads.download({
        url,
        filename: "resume.pdf",
        saveAs: true,
      });

      URL.revokeObjectURL(url);
    } catch {
      console.error("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-4 relative">
      <div className="flex items-center justify-end absolute top-0 right-0 -translate-y-1/2 -translate-x-[10px] gap-2">
        {canCopy && (
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-lg hover:shadow-xl hover:border-gray-400 disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
          </button>
        )}
        {canCopy && (
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
              copied
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-lg hover:shadow-xl hover:border-gray-400"
            }`}
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      <StickToBottom
        className="w-full h-[34.5rem] overflow-y-auto [&>div]:overflow-y-auto"
        resize="smooth"
        initial="smooth"
      >
        <StickToBottom.Content>
          <div ref={htmlRef} className="prose prose-sm max-w-none prose-gray">
            <ReactMarkdown
              remarkPlugins={[remarkBreaks]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-lg font-bold text-gray-900 mb-3 ">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-semibold text-gray-900 mb-2 mt-4">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 mt-3">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="text-sm text-gray-700 mb-2 space-y-1 list-disc list-inside">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="text-sm text-gray-700 mb-2 space-y-1 list-decimal list-inside">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-gray-700">{children}</em>
                ),
                hr: () => <hr className="my-4 border-gray-200" />,
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
