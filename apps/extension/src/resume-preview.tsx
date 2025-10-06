import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, FileText } from "lucide-react";
import { StickToBottom } from "use-stick-to-bottom";

export const ResumePreview = ({
  markdown,
  canCopy,
}: {
  markdown: string;
  canCopy: boolean;
}) => {
  const [copied, setCopied] = useState(false);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Formatted Content</span>
        </div>
        {canCopy && (
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              copied
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>
        )}
      </div>

      <StickToBottom
        className="w-full h-[27rem] overflow-y-auto  [&>div]:overflow-y-auto"
        resize="smooth"
        initial="smooth"
      >
        <StickToBottom.Content>
          <div ref={htmlRef} className="prose prose-sm max-w-none prose-gray">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-lg font-bold text-gray-900 mb-3">
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
