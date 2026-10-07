"use client";

import { useEffect, useState } from "react";

/** Types `text` out. Give it key={text} so a new string restarts the animation. */
export default function Typed({ text, speed = 22, instant = false }: { text: string; speed?: number; instant?: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (instant) return;
    const id = setInterval(() => setN((v) => (v >= text.length ? (clearInterval(id), v) : v + 1)), speed);
    return () => clearInterval(id);
  }, [text, speed, instant]);
  const shown = instant ? text : text.slice(0, n);
  return <span className={shown.length < text.length ? "caret" : ""}>{shown}</span>;
}
