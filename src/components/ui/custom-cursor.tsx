"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  
  // Use MotionValues for high-performance updates without re-renders
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smoother spring configuration
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 }
  const cursorX = useSpring(mouseX, springConfig)
  const cursorY = useSpring(mouseY, springConfig)

  // Inject styles to hide default cursor
  useEffect(() => {
    // Only apply on non-touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouchDevice) return

    const style = document.createElement('style')
    style.innerHTML = `
      @media (hover: hover) and (pointer: fine) {
        body, a, button, input, textarea, [role="button"], .cursor-pointer {
          cursor: none !important;
        }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
    // Only show custom cursor on non-touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouchDevice) return

    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // More aggressive clickable detection
      const isClickable = 
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'input' ||
        target.tagName.toLowerCase() === 'textarea' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.classList.contains('clickable') ||
        target.classList.contains('cursor-pointer') ||
        window.getComputedStyle(target).cursor === 'pointer'

      setIsHovering(!!isClickable)
    }

    const handleMouseOut = () => {
      setIsHovering(false)
    }
    
    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener("mousemove", moveCursor)
    window.addEventListener("mouseover", handleMouseOver)
    window.addEventListener("mouseout", handleMouseOut)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseenter", handleMouseEnter)

    return () => {
      window.removeEventListener("mousemove", moveCursor)
      window.removeEventListener("mouseover", handleMouseOver)
      window.removeEventListener("mouseout", handleMouseOut)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [mouseX, mouseY, isVisible])

  if (!isVisible) return null

  return (
    <>
      {/* 
        MAIN DOT: 
        Always white but uses mix-blend-mode: difference.
        On dark bg -> shows White.
        On light bg -> shows Black.
      */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovering ? 0 : 1, // Disappears into the ring on hover
        }}
        transition={{ duration: 0.15 }}
      />
      
      {/* 
        OUTER RING:
        Reacts to hover.
        Also uses mix-blend-mode: difference for perfect contrast.
      */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9998] mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: "white", // Solid white for difference math
        }}
        animate={{
          width: isHovering ? 60 : 20,
          height: isHovering ? 60 : 20,
          opacity: isHovering ? 1 : 0.3, // Solid when hovering, transparent ring when not
          // When hovering: it becomes a solid inverted circle
          // When not hovering: we want it to look like a ring. 
          // Since we can't easily animate border-width with mix-blend-mode nicely, 
          // we use the 'mask' trick or just simple opacity/scale. 
          // Let's go for a solid inverted bubble effect on hover.
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          mass: 0.6
        }}
      >
        {/* 
           This inner div creates the "Hole" in the ring when NOT hovering.
           On hover, we scale it down to 0 so the outer parent becomes a solid circle.
        */}
        <motion.div 
           className="w-full h-full bg-black rounded-full"
           animate={{
            scale: isHovering ? 0 : 0.8 // 0 = solid circle (hover), 0.8 = ring (default)
           }}
           transition={{ duration: 0.2 }}
        />
      </motion.div>
    </>
  )
}
