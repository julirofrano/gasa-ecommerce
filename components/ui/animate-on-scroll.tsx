"use client";

import { useRef, useEffect, type ReactNode } from "react";

interface AnimateOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: 1 | 2 | 3 | 4 | 5;
}

export function AnimateOnScroll({
  children,
  className = "",
  delay,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const delayClass = delay ? `stagger-${delay}` : "";

  return (
    <div
      ref={ref}
      className={`animate-fade-up ${delayClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
