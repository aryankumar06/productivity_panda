"use client";

import { useEffect, useRef, useState } from "react";

interface GlowingEffectProps {
  spread?: number;
  glow?: boolean;
  disabled?: boolean;
  proximity?: number;
  borderWidth?: number;
  className?: string;
  inactiveZone?: number;
}

export function GlowingEffect({
  spread = 40,
  glow = true,
  disabled = false,
  proximity = 64,
  borderWidth = 2,
  className,
  inactiveZone = 0.01,
}: GlowingEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (disabled) return;

    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const isNearElement = 
        x >= -proximity && 
        x <= rect.width + proximity && 
        y >= -proximity && 
        y <= rect.height + proximity;

      if (isNearElement) {
        setPosition({ x, y });
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setIsVisible(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [disabled, proximity]);

  if (disabled) return null;

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit] ${className || ""}`}
    >
      {/* Glow effect */}
      {glow && (
        <div
          className="absolute transition-opacity duration-300"
          style={{
            opacity: isVisible ? 1 : 0,
            left: position.x - spread * 2,
            top: position.y - spread * 2,
            width: spread * 4,
            height: spread * 4,
            background: `radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(59, 130, 246, 0.2) 40%, transparent 70%)`,
            filter: "blur(20px)",
            transform: "translate(0, 0)",
          }}
        />
      )}
      
      {/* Border glow effect */}
      <div
        className="absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: isVisible ? 1 : 0,
          background: `radial-gradient(
            ${spread * 2}px circle at ${position.x}px ${position.y}px,
            rgba(59, 130, 246, 0.6),
            rgba(99, 102, 241, 0.4) 40%,
            transparent 70%
          )`,
          WebkitMask: `
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0)
          `,
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: borderWidth,
        }}
      />
    </div>
  );
}

export default GlowingEffect;
