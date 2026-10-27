"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  X,
  Send,
  Minimize2,
  Maximize2,
  Trash2,
  Lightbulb,
  BookOpen,
  HelpCircle,
  StopCircle,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { aiService } from "../services/ai.service";
import { getErrorMessage } from "@/shared/utils";

interface ChatMessage {
  readonly id: string;
  readonly role: "user" | "tutor";
  readonly content: string;
  readonly timestamp: Date;
}

interface StudentAiTutorWidgetProps {
  readonly currentTopicId?: string;
  readonly currentTopicTitle?: string;
}

function sanitizeAiOutput(rawText: string): string {
  if (!rawText) return "";
  return rawText
    .replace(/\*{3,}/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .trim();
}

const SAMPLE_REQUESTS = [
  {
    icon: Lightbulb,
    label: "What should I study next?",
    prompt: "What topics should I focus on reviewing next based on my curriculum?",
  },
  {
    icon: HelpCircle,
    label: "Give me a practice question",
    prompt: "Can you give me a simple practice question to test my understanding of this topic?",
  },
  {
    icon: BookOpen,
    label: "Explain the main idea simply",
    prompt: "Can you explain the main idea of this lesson in simple words with a clear example?",
  },
  {
    icon: AlertCircle,
    label: "Common mistakes to avoid",
    prompt: "What are common mistakes students make on this topic and how can I avoid them?",
  },
  {
    icon: CheckCircle2,
    label: "Step-by-step problem guide",
    prompt: "Can you show me a step-by-step method to solve typical problems for this topic?",
  },
  {
    icon: Sparkles,
    label: "Key exam tips and formulas",
    prompt: "What are the most important terms and formulas I need to remember for my exam?",
  },
] as const;

export function StudentAiTutorWidget({
  currentTopicId,
  currentTopicTitle,
}: StudentAiTutorWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSamples, setShowSamples] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 400,
    height: 560,
  });
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  const [messages, setMessages] = useState<readonly ChatMessage[]>([
    {
      id: "initial-greeting",
      role: "tutor",
      content: currentTopicTitle
        ? `Hi! I'm your AI Assistant. We are exploring "${currentTopicTitle}". Ask me any question, request what to study next, or pick a sample question below!`
        : "Hi! I'm your AI Assistant. Ask me any question about your lessons or pick a sample question below to get started!",
      timestamp: new Date(),
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isStreaming]);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: size.width,
      startH: size.height,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const dx = resizeRef.current.startX - e.clientX;
      const dy = resizeRef.current.startY - e.clientY;
      const newW = Math.min(Math.max(280, resizeRef.current.startW + dx), window.innerWidth - 16);
      const newH = Math.min(Math.max(340, resizeRef.current.startH + dy), window.innerHeight - 32);
      setSize({ width: newW, height: newH });
    };

    const handleMouseUp = () => {
      resizeRef.current = null;
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isStreaming) return;

    handleStop();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    const tutorMsgId = `assistant-${Date.now()}`;
    const initialTutorMsg: ChatMessage = {
      id: tutorMsgId,
      role: "tutor",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, initialTutorMsg]);
    setInputMessage("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await aiService.streamTutor(
        trimmed,
        {
          topicId: currentTopicId,
          signal: controller.signal,
          onToken: (chunk: string) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === tutorMsgId ? { ...msg, content: msg.content + chunk } : msg
              )
            );
          },
        }
      );
    } catch (err: unknown) {
      const friendlyError = getErrorMessage(
        err,
        "I could not load the answer right now. Please check your connection and try again."
      );
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tutorMsgId && !msg.content
            ? {
                ...msg,
                content: friendlyError,
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleClearHistory = () => {
    handleStop();
    setMessages([
      {
        id: "fresh-greeting",
        role: "tutor",
        content: "Chat cleared! How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  };

  // Pure circular trigger button — borderless, large bright primary AI icon, gentle floating hover
  if (!isOpen) {
    return (
      <aside aria-label="AI Assistant" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen(true);
              setIsMinimized(false);
            }
          }}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 ease-out flex items-center justify-center cursor-pointer border-none outline-hidden select-none"
          style={{
            borderRadius: "9999px",
            animation: "eduBridgeAiGentleFloat 3.5s ease-in-out infinite",
          }}
          aria-label="Open AI Assistant"
          title="Ask AI Assistant"
        >
          <style>{`
            @keyframes eduBridgeAiGentleFloat {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-5px); }
            }
          `}</style>
          <Sparkles className="w-7 h-7 text-primary-foreground" />
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label="AI Assistant Chat"
      style={{
        width: isMinimized ? "auto" : `${size.width}px`,
        height: isMinimized ? "auto" : `${size.height}px`,
      }}
      className="fixed bottom-2 right-2 sm:bottom-6 sm:right-6 z-50 max-w-[calc(100vw-1rem)] max-h-[90vh] flex flex-col bg-card text-card-foreground border border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 select-text"
    >
      {/* Top-Left Resize Drag Handle */}
      {!isMinimized && (
        <div
          onMouseDown={startResize}
          className="absolute top-0 left-0 w-5 h-5 cursor-nwse-resize z-30 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity select-none"
          title="Drag to resize assistant"
        >
          <div className="w-2.5 h-2.5 border-t-2 border-l-2 border-primary-foreground" />
        </div>
      )}

      {/* Header — using correct AI Sparkles icon */}
      <div className="flex items-center justify-between pl-6 pr-3 py-2.5 sm:py-3 bg-primary text-primary-foreground select-none shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-primary-foreground/15 rounded-lg shrink-0">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold tracking-tight truncate">
                AI Assistant
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            </div>
            {currentTopicTitle && (
              <p className="text-[10px] text-primary-foreground/80 truncate max-w-[180px] sm:max-w-[240px]">
                {currentTopicTitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleClearHistory}
            className="p-1 text-primary-foreground/75 hover:text-primary-foreground hover:bg-primary-foreground/15 rounded-md transition-colors cursor-pointer"
            title="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-primary-foreground/75 hover:text-primary-foreground hover:bg-primary-foreground/15 rounded-md transition-colors cursor-pointer"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? (
              <Maximize2 className="w-3.5 h-3.5" />
            ) : (
              <Minimize2 className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 text-primary-foreground/75 hover:text-primary-foreground hover:bg-primary-foreground/15 rounded-md transition-colors cursor-pointer"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Collapsible Vertical Sample Requests List */}
          <div className="border-b border-border bg-muted/30 shrink-0">
            <button
              type="button"
              onClick={() => setShowSamples((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <span>Suggested Questions ({SAMPLE_REQUESTS.length})</span>
              {showSamples ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showSamples && (
              <div className="px-3 pb-2.5 pt-0.5 space-y-1.5 max-h-[160px] overflow-y-auto">
                {SAMPLE_REQUESTS.map((sample, idx) => {
                  const Icon = sample.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isStreaming}
                      onClick={() => handleSendMessage(sample.prompt)}
                      className="w-full flex items-center gap-2 p-2 text-left rounded-xl bg-card hover:bg-muted border border-border transition-colors text-xs text-foreground cursor-pointer disabled:opacity-50 group shadow-2xs"
                    >
                      <div className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="truncate flex-1 font-medium text-[11px]">
                        {sample.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        Ask →
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Conversation Thread with clean text without asterisks */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-[180px] text-xs">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const cleanedContent = isUser ? msg.content : sanitizeAiOutput(msg.content);
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl leading-relaxed whitespace-pre-wrap break-words ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-br-xs shadow-xs"
                        : "bg-muted/70 text-foreground border border-border rounded-bl-xs"
                    }`}
                  >
                    {cleanedContent}
                    {!isUser && isStreaming && msg.id === messages[messages.length - 1]?.id && (
                      <span className="inline-block w-1.5 h-3 ml-1 bg-primary animate-pulse align-middle" />
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input & Action Bar */}
          <div className="p-2.5 sm:p-3 bg-card border-t border-border shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputMessage);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                disabled={isStreaming}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  isStreaming
                    ? "Thinking..."
                    : "Ask anything about this topic..."
                }
                className="flex-1 min-w-0 h-9 px-3 text-xs bg-muted/60 border border-border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-primary disabled:opacity-50 text-foreground placeholder:text-muted-foreground"
              />

              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="h-9 px-2.5 flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 rounded-xl transition-colors shrink-0 text-xs font-medium cursor-pointer"
                  title="Stop"
                >
                  <StopCircle className="w-4 h-4 mr-1 shrink-0" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="h-9 w-9 flex items-center justify-center bg-primary hover:opacity-90 text-primary-foreground rounded-xl shadow-xs transition-colors shrink-0 disabled:opacity-40 cursor-pointer"
                  aria-label="Send question"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>
        </>
      )}
    </aside>
  );
}
