"use client";

import { useEffect, useRef } from "react";

export function AutoPrint({ autoPrint }: { autoPrint: boolean }) {
  const hasPrintedRef = useRef(false);

  useEffect(() => {
    if (autoPrint && !hasPrintedRef.current) {
      hasPrintedRef.current = true;
      const timer = setTimeout(() => {
        window.print();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  return null;
}
