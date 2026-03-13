"use client";

import { useEffect, useRef } from "react";

export function useTitleFlash(message: string | null) {
  const originalTitle = useRef("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!message) {
      // Stop flashing
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (originalTitle.current) {
        document.title = originalTitle.current;
      }
      return;
    }

    if (!originalTitle.current) {
      originalTitle.current = document.title;
    }

    let showing = false;
    intervalRef.current = setInterval(() => {
      document.title = showing ? originalTitle.current : message;
      showing = !showing;
    }, 1000);

    const handleFocus = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.title = originalTitle.current;
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (originalTitle.current) {
        document.title = originalTitle.current;
      }
      window.removeEventListener("focus", handleFocus);
    };
  }, [message]);
}
