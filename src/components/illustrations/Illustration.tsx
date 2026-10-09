"use client";
import { useEffect, useRef } from "react";
import { FIGURES } from "./figures";
import type { Figure } from "./types";

interface Props {
  figure: Figure;
  className?: string;
  title?: string;
  /** draw the ink in when scrolled into view */
  draw?: boolean;
  tone?: "light" | "dark";
}

export default function Illustration({ figure, className = "", title, draw = true, tone = "light" }: Props) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !draw) return;
    if (document.documentElement.hasAttribute("data-still") || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-drawn");
      return;
    }
    el.querySelectorAll("path").forEach((p) => {
      if (p.getAttribute("pathLength")) p.classList.add("sd");
    });
    el.classList.add("will-draw");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-drawn");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    // never leave artwork hidden if the observer is throttled
    const t = setTimeout(() => {
      if (document.visibilityState === "hidden") el.classList.add("is-drawn");
    }, 1500);
    return () => { io.disconnect(); clearTimeout(t); };
  }, [draw]);

  const Fig = FIGURES[figure];
  return (
    <svg
      ref={ref}
      viewBox="0 0 200 200"
      className={`ill ill-${tone} ${className}`}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      overflow="visible"
    >
      {title && <title>{title}</title>}
      <Fig />
    </svg>
  );
}
