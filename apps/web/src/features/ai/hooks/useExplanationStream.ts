"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { aiService } from "../services/ai.service";

export function useExplanationStream() {
  const [text, setText] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    stopStream();
    setText("");
    setError(null);
  }, [stopStream]);

  const startStream = useCallback(
    (questionId: string, studentAnswer?: string) => {
      stopStream();
      setText("");
      setError(null);
      setIsStreaming(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      aiService.streamExplanation(questionId, {
        studentAnswer,
        signal: controller.signal,
        onToken: (token) => {
          setText((prev) => prev + token);
        },
        onError: (errMsg) => {
          setError(errMsg);
          setIsStreaming(false);
        },
        onComplete: () => {
          setIsStreaming(false);
        },
      });
    },
    [stopStream]
  );

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    text,
    isStreaming,
    error,
    startStream,
    stopStream,
    reset,
  };
}
