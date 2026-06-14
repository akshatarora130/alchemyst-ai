"use client";

import { useEffect, useState } from "react";

export function useLingerTrue(active: boolean, lingerMs: number): boolean {
  const [visible, setVisible] = useState(active);

  useEffect(() => {
    if (active) {
      setVisible(true);
      return;
    }

    if (!visible) {
      return;
    }

    const timer = setTimeout(() => {
      setVisible(false);
    }, lingerMs);

    return () => {
      clearTimeout(timer);
    };
  }, [active, lingerMs, visible]);

  return active || visible;
}
