import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export const CustomCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const cursorSize = 20;
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 700 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX - cursorSize / 2);
      mouseY.set(e.clientY - cursorSize / 2);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", moveCursor);
    document.body.addEventListener("mouseenter", handleMouseEnter);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{
        translateX: cursorX,
        translateY: cursorY,
        opacity: isVisible ? 1 : 0,
      }}
      className="fixed top-0 left-0 w-5 h-5 bg-black dark:bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
    />
  );
};
