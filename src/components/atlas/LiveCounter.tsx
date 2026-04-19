import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface LiveCounterProps {
  /** final target value to count to on first scroll-in */
  target: number;
  /** ms per tick when "live" — set 0 to disable post-arrival ticking */
  tickMs?: number;
  /** how many to add per tick on average */
  tickIncrement?: number;
  /** label shown after the number */
  suffix?: string;
  /** prefix label */
  prefix?: string;
  className?: string;
}

/**
 * Counter that animates 0 → target on scroll into view, then continues to
 * tick up at a credible pace to feel "live".
 */
const LiveCounter = ({
  target,
  tickMs = 4500,
  tickIncrement = 1,
  suffix,
  prefix,
  className,
}: LiveCounterProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);

  // Count up on entry
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const duration = 1400;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(eased * target);
      valueRef.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  // Live tick
  useEffect(() => {
    if (!inView || tickMs <= 0) return;
    const id = setInterval(() => {
      const jitter = Math.random() < 0.5 ? tickIncrement : tickIncrement + 1;
      valueRef.current += jitter;
      setValue(valueRef.current);
    }, tickMs);
    return () => clearInterval(id);
  }, [inView, tickMs, tickIncrement]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span
        key={Math.floor(value / 10)}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="tabular-nums"
      >
        {value.toLocaleString()}
      </motion.span>
      {suffix}
    </span>
  );
};

export default LiveCounter;
