import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Navbar from "../components/Navbar";
import WishForm from "../components/WishForm";

/* Stable particles generated once */
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  size: (i % 3) * 2 + 3,
  color: ["#FF6B6B", "#FFE66D", "#A8EDEA", "#FFB4A2", "#ffffff"][i % 5],
  top: (i * 37 + 13) % 100,
  left: (i * 53 + 7) % 100,
  duration: 6 + (i % 5) * 1.5,
  delay: (i * 0.4) % 5,
  drift: ((i % 7) - 3) * 20,
}));

const FLOATING_ICONS = [
  { icon: "🎈", top: "12%", left: "5%", duration: 5.5, delay: 0 },
  { icon: "🎁", top: "28%", right: "7%", duration: 7, delay: 1 },
  { icon: "🎉", bottom: "28%", left: "8%", duration: 6.2, delay: 2.2 },
  { icon: "🎂", bottom: "14%", right: "6%", duration: 8, delay: 0.5 },
  { icon: "✨", top: "50%", left: "3%", duration: 4.8, delay: 1.5 },
  { icon: "🌟", top: "65%", right: "4%", duration: 6.5, delay: 0.8 },
];

function Card3D({ children, className, style }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), {
    stiffness: 200,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), {
    stiffness: 200,
    damping: 30,
  });

  const handleMouse = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
        ...style,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) =>
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      className="min-h-screen pb-20 relative overflow-hidden"
      style={{ backgroundColor: "#FFF9F0" }}
    >
      {/* Ambient light that follows cursor */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,107,107,0.07), transparent 70%)`,
        }}
      />

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              top: `${p.top}%`,
              left: `${p.left}%`,
              opacity: 0.35,
            }}
            animate={{
              y: [0, -120, 0],
              x: [0, p.drift, 0],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Floating emoji decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {FLOATING_ICONS.map((item, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl md:text-5xl select-none"
            style={{ opacity: 0.07, ...item }}
            animate={{
              y: [0, -(14 + i * 2), 0],
              rotate: [0, i % 2 === 0 ? 8 : -8, 0],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item.delay,
            }}
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      {/* Navbar */}
      <div className="flex justify-center mb-24 pt-10">
        <div className="w-full max-w-[1000px] px-4 py-4">
          <Navbar />
        </div>
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="text-center px-6 pt-4 pb-8 md:pt-8 md:pb-10"
      >
        <h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.2rem] font-bold mb-4 mt-80 leading-tight"
          style={{ fontFamily: "var(--font-playfair)", color: "#2D2D2D" }}
        >
          Tengeneza Birthday Wish{" "}
          <span
            style={{
              background:
                "linear-gradient(135deg, #FF6B6B 0%, #FF9A5C 40%, #FFE66D 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              backgroundSize: "200% auto",
              animation: "shimmer 3s linear infinite",
            }}
          >
            Maalum
          </span>
        </h1>
        <h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.2rem] font-bold mb-4 mt-80 leading-tight"
          style={{ fontFamily: "var(--font-playfair)", color: "#2D2D2D" }}
        >
          <span
            style={{
              background:
                "linear-gradient(135deg, #FF6B6B 0%, #FF9A5C 40%, #FFE66D 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              backgroundSize: "200% auto",
              animation: "shimmer 3s linear infinite",
            }}
          >
            Kwa Umpendae
          </span>
        </h1>

        <p
          className="text-base md:text-lg max-w-sm mx-auto leading-relaxed text-center"
          style={{ fontFamily: "var(--font-dm)", color: "#6B6B6B" }}
        >
          Mfurahishe mtu unayempenda kwa njia ya kipekee
        </p>

        {/* Decorative divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="mx-auto mt-5"
          style={{
            width: "60px",
            height: "3px",
            borderRadius: "2px",
            background: "linear-gradient(90deg, #FF6B6B, #FFE66D)",
            transformOrigin: "center",
          }}
        />
      </motion.div>

      {/* 3D Form Card */}
      <div className="px-4 sm:px-6 max-w-[580px] mx-auto relative z-10">
        <Card3D>
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden depth-card"
            style={{
              borderRadius: "24px",
              background: "linear-gradient(145deg, #ffffff 0%, #fffbf7 100%)",
              border: "1px solid rgba(255,180,162,0.3)",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: -40,
                left: -40,
                width: 120,
                height: 120,
                background:
                  "radial-gradient(circle, rgba(255,107,107,0.1) 0%, transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />

            <WishForm />
          </motion.div>
        </Card3D>

        {/* Steps indicator */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex items-center justify-center gap-6 mt-8 flex-wrap"
        >
          {[
            { step: "1", label: "Jaza Fomu" },
            { step: "2", label: "Inachakata" },
            { step: "3", label: "Share Link" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5"
                style={{
                  fontFamily: "var(--font-dm)",
                  fontSize: "12px",
                  color: "#6B6B6B",
                }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: "linear-gradient(135deg,#FF6B6B,#FFE66D)",
                    color: "#fff",
                    boxShadow: "0 2px 8px rgba(255,107,107,0.3)",
                  }}
                >
                  {item.step}
                </span>
                <span>
                  {item.icon} {item.label}
                </span>
              </div>
              {i < 2 && (
                <div
                  style={{
                    width: "20px",
                    height: "1px",
                    backgroundColor: "#E8D5C4",
                  }}
                />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
