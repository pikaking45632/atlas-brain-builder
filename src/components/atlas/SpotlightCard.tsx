import { useRef, MouseEvent, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** radius of the spotlight in px */
  radius?: number;
  /** opacity multiplier 0-1 */
  intensity?: number;
}

/**
 * Card wrapper that paints a 600px radial accent spotlight following the
 * cursor. The signature Linear/Vercel hover. Pure CSS via CSS variables.
 */
const SpotlightCard = ({
  children,
  radius = 600,
  intensity = 0.08,
  className,
  ...rest
}: SpotlightCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
    el.style.setProperty("--spot-opacity", "1");
  };

  const onLeave = () => {
    ref.current?.style.setProperty("--spot-opacity", "0");
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("spotlight-card", className)}
      style={{
        ["--spot-radius" as any]: `${radius}px`,
        ["--spot-intensity" as any]: intensity,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

export default SpotlightCard;
