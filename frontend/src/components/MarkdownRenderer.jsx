import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Copy, Check } from "lucide-react";

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef(null);

  const copy = async () => {
    try {
      const text = preRef.current?.innerText || "";
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="code-block-wrapper">
      <button data-testid="copy-code-button" type="button" onClick={copy} className="copy-btn" aria-label="Copy code">
        {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
      </button>
      <pre ref={preRef} className={className}>{children}</pre>
    </div>
  );
}

export default function MarkdownRenderer({ content }) {
  return (
    <div className="prose-content" data-testid="post-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre: ({ node, children, ...props }) => <CodeBlock {...props}>{children}</CodeBlock>,
          a: ({ node, ...props }) => <a {...props} target={props.href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" />,
        }}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}
