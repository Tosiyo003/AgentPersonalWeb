"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "AI 时间线" },
  { href: "/resources", label: "学习资源" },
  { href: "/projects", label: "我的项目" },
  { href: "/about", label: "关于我" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shadow-lg group-hover:shadow-blue-500/40 transition-shadow duration-300">
            AI
          </span>
          <span
            className="text-sm font-semibold tracking-wide hidden sm:block"
            style={{ fontFamily: "var(--font-space-grotesk)", color: "rgba(255,255,255,0.85)" }}
          >
            AI Journey
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative px-4 py-2 rounded-lg text-sm transition-colors duration-200"
                  style={{
                    color: isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
                    fontFamily: "var(--font-noto-sc)",
                  }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: "rgba(59,130,246,0.12)",
                        border: "1px solid rgba(59,130,246,0.25)",
                      }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors duration-200"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
              fontFamily: "var(--font-jetbrains)",
            }}
            title="Language (coming soon)"
          >
            <span>中</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
            <span>EN</span>
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.6)",
            }}
            aria-label="GitHub"
          >
            <GitHubIcon />
          </a>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.6)",
            }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className="sr-only">Menu</span>
            <div className="flex flex-col gap-1.5 w-4">
              <span
                className="block h-px bg-current transition-transform duration-200 origin-center"
                style={{ transform: mobileOpen ? "translateY(5px) rotate(45deg)" : "none" }}
              />
              <span
                className="block h-px bg-current transition-opacity duration-200"
                style={{ opacity: mobileOpen ? 0 : 1 }}
              />
              <span
                className="block h-px bg-current transition-transform duration-200 origin-center"
                style={{ transform: mobileOpen ? "translateY(-5px) rotate(-45deg)" : "none" }}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <ul className="px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2.5 rounded-lg text-sm transition-colors duration-200"
                      style={{
                        color: isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
                        background: isActive ? "rgba(59,130,246,0.1)" : "transparent",
                        border: isActive ? "1px solid rgba(59,130,246,0.2)" : "1px solid transparent",
                        fontFamily: "var(--font-noto-sc)",
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
