import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

export const ResumePreview = ({ markdown }: { markdown: string }) => {
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
      <button
        onClick={handleCopy}
        className="px-3 py-1 rounded bg-green-600 text-white text-sm"
      >
        {copied ? "Copied!" : "Copy to Docs"}
      </button>

      <div ref={htmlRef} className="prose max-w-none mt-4">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
};
