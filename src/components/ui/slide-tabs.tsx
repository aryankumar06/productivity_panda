import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface SlideTabsProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
  className?: string;
}

export const SlideTabs = ({ tabs, activeTab, onChange, className = "" }: SlideTabsProps) => {
  const [position, setPosition] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <ul
      onMouseLeave={() => {
        // Optional: Reset to active tab position on leave if desired,
        // or just hide the hover effect. For this design, we hide on leave
        // but the active state handles the persistent indicator if we wanted one.
        // However, the requested design uses this "cursor" as the hover/selection indicator.
        // Let's modify it to snap back to the active tab.
        const activeElement = document.getElementById(`tab-${activeTab}`);
        if(activeElement) {
            const { offsetLeft, offsetWidth } = activeElement;
            setPosition({
                left: offsetLeft,
                width: offsetWidth,
                opacity: 1,
            }); 
        } else {
             setPosition((pv) => ({
              ...pv,
              opacity: 0,
            }));
        }
      }}
      className={`relative mx-auto flex w-fit rounded-full border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-1 ${className}`}
    >
      {tabs.map((tab) => (
        <Tab 
            key={tab} 
            setPosition={setPosition} 
            isActive={activeTab === tab}
            onClick={() => onChange(tab)}
        >
          {tab}
        </Tab>
      ))}

      <Cursor position={position} />
    </ul>
  );
};

const Tab = ({ 
    children, 
    setPosition, 
    isActive, 
    onClick 
}: { 
    children: string; 
    setPosition: any; 
    isActive: boolean;
    onClick: () => void;
}) => {
  const ref = useRef<HTMLLIElement>(null);

  // Initialize position to active tab on mount/update
  useEffect(() => {
    if (isActive && ref.current) {
        const { width } = ref.current.getBoundingClientRect();
        setPosition({
            left: ref.current.offsetLeft,
            width,
            opacity: 1,
        });
    }
  }, [isActive, setPosition]);

  return (
    <li
      id={`tab-${children}`}
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => {
        if (!ref?.current) return;

        const { width } = ref.current.getBoundingClientRect();

        setPosition({
          left: ref.current.offsetLeft,
          width,
          opacity: 1,
        });
      }}
      className={`relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase whitespace-nowrap md:px-5 md:py-3 md:text-base transition-colors duration-500 ${
          isActive ? "text-white mix-blend-difference" : "text-neutral-600 dark:text-neutral-400 hover:text-white hover:mix-blend-difference"
      }`}
    >
      {children}
    </li>
  );
};

const Cursor = ({ position }: { position: any }) => {
  return (
    <motion.li
      animate={{
        ...position,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30
      }}
      className="absolute z-0 h-7 rounded-full bg-black dark:bg-white md:h-12"
    />
  );
};
