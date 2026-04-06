"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface NavItem {
  id: string;
  label: string;
  color: string;
  year: string;
}

export default function FloatingNav({ items }: { items: NavItem[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible entry
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        setActiveId(topmost.target.id);
      },
      {
        threshold: 0.3,
        rootMargin: "-10% 0px -55% 0px",
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-2.5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Timeline navigation"
    >
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className="flex items-center gap-2.5 group"
            title={item.label}
            aria-label={`跳转到 ${item.label}`}
          >
            {/* Label */}
            <AnimatePresence>
              {(hovered || isActive) && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.18 }}
                  className="text-right"
                >
                  <p
                    className="text-xs font-medium whitespace-nowrap"
                    style={{
                      color: isActive ? item.color : "rgba(255,255,255,0.35)",
                      fontFamily: "var(--font-noto-sc)",
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: "rgba(255,255,255,0.2)",
                      fontFamily: "var(--font-jetbrains)",
                      fontSize: "0.65rem",
                    }}
                  >
                    {item.year}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dot */}
            <motion.div
              animate={{
                scale: isActive ? 1.5 : 1,
                backgroundColor: isActive ? item.color : "rgba(255,255,255,0.18)",
              }}
              transition={{ duration: 0.2 }}
              className="w-2 h-2 rounded-full"
              style={{
                boxShadow: isActive ? `0 0 8px ${item.color}80, 0 0 16px ${item.color}40` : "none",
              }}
            />
          </button>
        );
      })}

      {/* Vertical connector line */}
      <div
        className="absolute right-[3px] top-3 bottom-3 w-px -z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent)",
        }}
      />
    </div>
  );
}
