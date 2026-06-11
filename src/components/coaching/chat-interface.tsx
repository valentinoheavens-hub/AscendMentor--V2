"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, RefreshCw } from "lucide-react";
import type { SessionType } from "@/types/platform";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  sessionType: SessionType;
  sessionId: string | null;
}

const SESSION_LABELS: Record<SessionType, string> = {
  coaching: "BGC Coaching",
  reflection: "Weekly Reflection",
  assessment_debrief: "Assessment Debrief",
};

const STARTER_PROMPTS: Record<SessionType, string[]> = {
  coaching: [
    "What should I focus on first to improve my BGC Mastery Score?",
    "Help me create a 90-day clarity plan for my organisation.",
    "What does Strategic Direction mean in the BGC framework?",
  ],
  reflection: [
    "Walk me through this week's leadership wins and challenges.",
    "What patterns should I notice in my leadership behaviour?",
    "How do I capture evidence of progress for my belt upgrade?",
  ],
  assessment_debrief: [
    "Explain my Clarity Assessment results in detail.",
    "What are my biggest gaps and how do I close them?",
    "Which dimension should I tackle first based on my scores?",
  ],
};

export function ChatInterface({ sessionType, sessionId: initialSessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sessionIdRef = useRef<string | null>(initialSessionId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;
      const userMsg: Message = { role: "user", content: text.trim() };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput("");
      setStreaming(true);

      const assistantMsg: Message = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMsg]);

      try {
        // Lazily create a session on the first message
        if (!sessionIdRef.current) {
          const sessionRes = await fetch(`/api/bgc-coach?type=${sessionType}`);
          if (sessionRes.ok) {
            const { session_id } = await sessionRes.json() as { session_id?: string };
            sessionIdRef.current = session_id ?? null;
          }
        }

        const res = await fetch("/api/bgc-coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages,
            session_id: sessionIdRef.current,
            session_type: sessionType,
          }),
        });

        if (!res.ok || !res.body) throw new Error("Stream failed");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") break;
            try {
              const { text } = JSON.parse(payload) as { text?: string };
              if (text) {
                setMessages((prev) => {
                  const copy = [...prev];
                  copy[copy.length - 1] = {
                    role: "assistant",
                    content: copy[copy.length - 1].content + text,
                  };
                  return copy;
                });
              }
            } catch {
              // ignore malformed chunk
            }
          }
        }
      } catch {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
          };
          return copy;
        });
      } finally {
        setStreaming(false);
      }
    },
    [messages, sessionType, streaming]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const starters = STARTER_PROMPTS[sessionType];

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 py-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="text-3xl">🥋</span>
            </div>
            <div className="text-center max-w-sm">
              <p className="font-semibold text-foreground mb-1">
                {SESSION_LABELS[sessionType]}
              </p>
              <p className="text-sm text-muted-foreground">
                Your personalised BGC framework coach. Ask anything about your
                leadership clarity journey.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {starters.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm">🥋</span>
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-card border border-border/40 text-foreground rounded-tl-sm"
                }`}
              >
                {msg.content}
                {msg.role === "assistant" &&
                  msg.content === "" &&
                  streaming && (
                    <span className="inline-block w-2 h-4 bg-current animate-pulse ml-0.5" />
                  )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-bold text-muted-foreground">
                    ME
                  </span>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/40 pt-4">
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            New conversation
          </button>
        )}
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your BGC coach…"
            rows={1}
            disabled={streaming}
            className="flex-1 resize-none rounded-xl bg-card border border-border/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors min-h-[44px] max-h-32 overflow-y-auto disabled:opacity-50"
            style={{ height: "auto" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
            className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {streaming ? (
              <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
            ) : (
              <Send className="h-4 w-4 text-primary-foreground" />
            )}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
