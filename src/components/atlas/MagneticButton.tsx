import { useRef, MouseEvent, ReactNode, ButtonHTMLAttributes } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface MagneticButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"> {
  children: ReactNode;
  strength?: number;
  radius?: number;
}

/**
 * Magnetic CTA — translates up to `strength`px toward the cursor when within
 * `radius`px. Springs back on leave. Use ONLY on hero / pricing primary CTAs.
 */
const MagneticButton = ({
  children,
  strength = 6,
  radius = 40,
  className,
  ...rest
}: MagneticButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 250, damping: 18, mass: 0.4 });

  const onMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const reach = Math.max(rect.width, rect.height) / 2 + radius;
    if (dist > reach) {
      x.set(0); y.set(0);
      return;
    }
    const t = Math.min(1, 1 - dist / reach);
    x.set((dx / reach) * strength * (0.4 + t));
    y.set((dy / reach) * strength * (0.4 + t));
  };

  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      {...(rest as any)}
    >
      {children}
    </motion.button>
  );
};

export default MagneticButton;
