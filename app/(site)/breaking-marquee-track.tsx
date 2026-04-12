"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type Props = {
  text: string;
  className?: string;
};

/**
 * Marquee after mount only — avoids hydration mismatch (server cannot know
 * `prefers-reduced-motion` or measured widths vs client).
 */
export function BreakingMarqueeTrack({ text, className = "" }: Props) {
  const firstRef = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [durationSec, setDurationSec] = useState(36);

  useEffect(() => {
    let mq: MediaQueryList | undefined;
    const onChange = () => {
      if (mq) setReduceMotion(mq.matches);
    };
    const id = window.setTimeout(() => {
      setMounted(true);
      mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduceMotion(mq.matches);
      mq.addEventListener("change", onChange);
    }, 0);
    return () => {
      window.clearTimeout(id);
      mq?.removeEventListener("change", onChange);
    };
  }, []);

  useLayoutEffect(() => {
    if (!mounted || reduceMotion) return;
    const el = firstRef.current;
    if (!el) return;
    const w = el.getBoundingClientRect().width;
    if (w < 8) return;
    const pxPerSec = 72;
    setDurationSec(Math.max(14, Math.min(88, w / pxPerSec)));
  }, [text, reduceMotion, mounted]);

  if (!text.trim()) {
    return null;
  }

  const staticLine = (
    <p className={`truncate text-sm font-medium leading-snug text-zinc-800 ${className}`}>{text}</p>
  );

  if (!mounted || reduceMotion) {
    return staticLine;
  }

  return (
    <div className={`relative min-h-[1.35rem] w-full min-w-0 overflow-hidden ${className}`}>
      <div
        className="breaking-marquee-animate flex w-max will-change-transform"
        style={
          {
            "--breaking-marquee-duration": `${durationSec}s`,
          } as CSSProperties
        }
      >
        <span
          ref={firstRef}
          className="inline-block shrink-0 whitespace-nowrap py-0.5 pl-1 pr-14 text-sm font-medium leading-snug text-zinc-800"
        >
          {text}
        </span>
        <span
          className="breaking-marquee-dup inline-block shrink-0 whitespace-nowrap py-0.5 pr-14 text-sm font-medium leading-snug text-zinc-800"
          aria-hidden
        >
          {text}
        </span>
      </div>
    </div>
  );
}
