import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css"; // choose theme you like
import "./ChatMessages.css";

const ChatMessages = ({ messages, isSending }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isSending]);

  return (
    <div className="messages" aria-live="polite">
      {messages.map((m, index) => (
        <div key={index} className={`msg msg-${m.type}`}>
          <div className="msg-role" aria-hidden="true">
            {m.type === "user" ? "You" : "Spectra"}
          </div>

          {/* Markdown + code rendering */}
          <div className="msg-bubble">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  return !inline ? (
                    <pre className={className}>
                      <code {...props}>{children}</code>
                    </pre>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {m.content}
            </ReactMarkdown>
          </div>

          {/* Actions */}
          <div className="msg-actions" role="group" aria-label="Message actions">
            <button
              type="button"
              aria-label="Copy message"
              onClick={() => navigator.clipboard.writeText(m.content)}
            >
              📋
            </button>
            {m.type === "ai" && (
              <>
                <button type="button">👍</button>
                <button type="button">👎</button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const u = new SpeechSynthesisUtterance(m.content);
                      speechSynthesis.speak(u);
                    } catch {}
                  }}
                >
                  🔊
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {/* AI typing */}
      {isSending && (
        <div className="msg msg-ai pending">
          <div className="msg-role" aria-hidden="true">AI</div>
          <div className="msg-bubble typing-dots" aria-label="AI is typing">
            <span /><span /><span />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;