import { motion, Transition, Variants } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  variant?: "fade" | "slide" | "scale" | "elegant" | "smooth" | "slideUp" | "slideDown" | "premium";
}

// Premium easing curves for smoother animations
const easings = {
  smooth: [0.4, 0, 0.2, 1],
  spring: [0.22, 1, 0.36, 1],
  gentle: [0.25, 0.4, 0.25, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
} as const;

const variants: Record<string, {
  initial: Record<string, number>;
  animate: Record<string, number>;
  exit: Record<string, number>;
  transition: Transition;
}> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.4, ease: easings.gentle }
  },
  slide: {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
    transition: { duration: 0.45, ease: easings.spring }
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { 
      duration: 0.5, 
      ease: easings.spring,
      opacity: { duration: 0.3 }
    }
  },
  slideDown: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { 
      duration: 0.5, 
      ease: easings.spring,
      opacity: { duration: 0.3 }
    }
  },
  scale: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
    transition: { duration: 0.4, ease: easings.gentle }
  },
  elegant: {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -15, scale: 1.01 },
    transition: { 
      duration: 0.5, 
      ease: easings.spring,
      opacity: { duration: 0.3 },
      scale: { duration: 0.5 }
    }
  },
  smooth: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { 
      duration: 0.35, 
      ease: easings.smooth
    }
  },
  premium: {
    initial: { opacity: 0, y: 24, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -16, scale: 1.005 },
    transition: { 
      duration: 0.55,
      ease: easings.spring,
      opacity: { duration: 0.35, ease: easings.gentle },
      scale: { duration: 0.6, ease: easings.gentle },
      y: { duration: 0.55, ease: easings.spring }
    }
  }
};

const PageTransition = ({ children, variant = "premium" }: PageTransitionProps) => {
  const selectedVariant = variants[variant];
  
  return (
    <motion.div
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      exit={selectedVariant.exit}
      transition={selectedVariant.transition}
      className="will-change-transform will-change-opacity"
      style={{ 
        transformOrigin: "center top",
        backfaceVisibility: "hidden",
        perspective: 1000,
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
