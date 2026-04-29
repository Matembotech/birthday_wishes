"use client";
import { motion } from "framer-motion";
import { useState } from "react";

const NAV_LINKS = ["Home", "About", "Pricing", "Contact"];

export default function Navbar() {
  const [active, setActive] = useState("Home");

  return (
    <motion.nav
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full pt-10 pb-6 px-4"
    >
      <div
        className="w-[92%] md:w-[85%] mx-auto flex items-center justify-between rounded-full py-2 md:py-0"
        style={{
          background: "#fff",
          boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
          border: "1.5px solid rgba(220,220,220,0.8)",
        }}
      >
        {/* ── LEFT: Logo ── */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="flex items-center gap-2.5 cursor-pointer"
            whileHover="hover"
          >
            <motion.div
              variants={{ hover: { rotate: 12, scale: 1.08 } }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-[44px] h-[44px] rounded-full flex items-center justify-center text-[20px] flex-shrink-0"
              style={{
                background: "#111",
                boxShadow: "0 0 0 2px rgba(255,107,107,0.35)",
              }}
            >
              🎂
            </motion.div>
            <span
              className="text-[14.5px] font-bold tracking-tight whitespace-nowrap"
              style={{ fontFamily: "var(--font-dm)" }}
            >
              <span style={{ color: "#1a1a1a" }}>Birthday</span>
              <span
                style={{
                  marginLeft: 3,
                  background: "linear-gradient(135deg, #FF6B6B, #FF9A5C)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Wishes
              </span>
            </span>
          </motion.div>
        </div>

        {/* ── MIDDLE: Nav Links ── */}
        <div className="hidden md:flex flex-1 items-center justify-between gap-0.5">
          {NAV_LINKS.map((link) => (
            <button
              key={link}
              onClick={() => setActive(link)}
              className="px-[15px] py-[7px] rounded-full text-[14px] font-semibold border-none cursor-pointer transition-all duration-200 whitespace-nowrap"
              style={{
                background:
                  active === link ? "rgba(255,107,107,0.09)" : "transparent",
                color: active === link ? "#FF6B6B" : "#2D2D2D",
              }}
            >
              {link}
            </button>
          ))}
        </div>

        {/* ── RIGHT: Actions ── */}
        <div className="hidden md:flex flex-1 items-center justify-center pr-5">
          <button
            className="text-[13.5px] font-semibold cursor-pointer transition-all duration-200"
            style={{
              color: "#2D2D2D",
            }}
            sni
          >
            Sign in
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
