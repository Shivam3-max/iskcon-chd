"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Adds .is-in to every .reveal element as it scrolls into view (once). */
export default function RevealObserver() {
  const path = usePathname();
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.is-in), .reveal-img:not(.is-in)"));
    if (document.documentElement.hasAttribute("data-still")) {
      els.forEach((e) => e.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          el.style.transitionDelay = `${Number(el.dataset.delay ?? 0)}ms`;
          el.classList.add("is-in");
          io.unobserve(el);
        }
      }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((e) => io.observe(e));
    // safety net when observers are throttled (hidden tabs, print)
    const t = setTimeout(() => {
      if (document.visibilityState === "hidden") els.forEach((e) => e.classList.add("is-in"));
    }, 1500);
    return () => { io.disconnect(); clearTimeout(t); };
  }, [path]);
  return null;
}
