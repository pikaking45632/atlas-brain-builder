import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Maximize2 } from "lucide-react";
import { AGENTS, AGENTS_BY_ID, AgentId } from "@/data/agents";
import { useOffice, HiredAgent } from "@/store/office";

const ease = [0.16, 1, 0.3, 1] as const;

const GRID_COLS = 4;
const GRID_ROWS = 3;
const TILE = 92; // base tile size in scene units
const ISO_X = 0.866; // cos(30deg)
const ISO_Y = 0.5;   // sin(30deg)

// Tailwind-like desk colour swatches. Pure HSL.
const DESK_COLORS: Record<string, string> = {
  oak: "hsl(32 45% 65%)",
  walnut: "hsl(20 30% 35%)",
  white: "hsl(0 0% 92%)",
  black: "hsl(220 10% 18%)",
};

const PLANT_COLORS: Record<string, string> = {
  monstera: "hsl(140 50% 35%)",
  snake: "hsl(95 35% 45%)",
  succulent: "hsl(120 40% 55%)",
  none: "transparent",
};

const STATUS_COLOR: Record<string, string> = {
  idle: "hsl(142 71% 45%)",
  thinking: "hsl(38 92% 55%)",
  working: "hsl(221 83% 53%)",
};

interface SceneProps {
  /** Pixel size of the rendered scene. Internal layout scales to fit. */
  size?: number;
  compact?: boolean;
  showLabels?: boolean;
  onAgentClick?: (agentId: AgentId) => void;
  onEmptyClick?: () => void;
  onExpand?: () => void;
}

const isoTransform = (x: number, y: number) => ({
  left: `${(x - y) * ISO_X * TILE}px`,
  top: `${(x + y) * ISO_Y * TILE}px`,
});

const OfficeScene = ({
  size = 480,
  compact = false,
  showLabels = false,
  onAgentClick,
  onEmptyClick,
  onExpand,
}: SceneProps) => {
  const { hired, statuses, selectedAgentId } = useOffice();
  const [hovered, setHovered] = useState<AgentId | null>(null);
  const tickRef = useRef(0);
  const [, force] = useState(0);

  // Drive a slow tick to rotate idle micro-animations on different
  // staggered intervals per agent without keeping each in state.
  useEffect(() => {
    const interval = window.setInterval(() => {
      tickRef.current += 1;
      force((n) => n + 1);
    }, 4000);
    return () => window.clearInterval(interval);
  }, []);

  const sceneWidth = (GRID_COLS + GRID_ROWS) * ISO_X * TILE;
  const sceneHeight = (GRID_COLS + GRID_ROWS) * ISO_Y * TILE + TILE;
  const scale = size / sceneWidth;

  const tiles = useMemo(() => {
    const list: { x: number; y: number; agent?: HiredAgent }[] = [];
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        const agent = hired.find((h) => h.gridX === x && h.gridY === y);
        list.push({ x, y, agent });
      }
    }
    return list;
  }, [hired]);

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: size, height: size * 0.75 }}
    >
      {onExpand && (
        <button
          onClick={onExpand}
          className="absolute top-3 right-3 z-30 inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-card/95 backdrop-blur border border-border text-[11.5px] font-medium text-foreground hover:bg-card shadow-sm transition-colors"
        >
          <Maximize2 className="w-3 h-3" />
          Open Office
        </button>
      )}

      <div
        className="absolute"
        style={{
          width: sceneWidth,
          height: sceneHeight,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center",
          left: "50%",
          top: "50%",
        }}
      >
        {/* Floor base */}
        <div
          className="absolute"
          style={{
            ...isoTransform(-0.5, -0.5),
            width: (GRID_COLS + 1) * TILE * ISO_X * 2,
            height: (GRID_ROWS + 1) * TILE * ISO_Y * 2,
            transform: "translate(0, 0) skewX(-30deg) scaleY(0.866)",
            transformOrigin: "0 0",
            background:
              "linear-gradient(180deg, hsl(220 25% 96%) 0%, hsl(220 20% 90%) 100%)",
            border: "1px solid hsl(220 20% 88%)",
            borderRadius: 12,
          }}
        />

        {/* Floor tiles for grid feel */}
        {tiles.map((tile, i) => {
          const pos = isoTransform(tile.x, tile.y);
          const isEmpty = !tile.agent;
          return (
            <motion.div
              key={`tile-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
              className="absolute"
              style={{
                ...pos,
                width: TILE,
                height: TILE * ISO_Y * 2,
                transform: "translate(0, 0)",
              }}
            >
              {/* Tile diamond outline */}
              <div
                className="absolute"
                style={{
                  width: TILE,
                  height: TILE,
                  transform: `rotate(45deg) scale(${ISO_X}, ${ISO_Y})`,
                  transformOrigin: "0 0",
                  left: TILE * 0.5,
                  top: 0,
                  border: "1px dashed hsl(220 20% 85%)",
                  background: isEmpty
                    ? "hsl(220 20% 94% / 0.4)"
                    : "transparent",
                }}
              />
              {isEmpty && onEmptyClick && (
                <button
                  onClick={onEmptyClick}
                  className="absolute inset-0 flex items-center justify-center text-muted-foreground hover:text-accent transition-colors group"
                  style={{ zIndex: 2 }}
                  aria-label="Hire an agent for this desk"
                >
                  <span className="opacity-30 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider">
                    <Plus className="w-3 h-3" />
                    Hire
                  </span>
                </button>
              )}
            </motion.div>
          );
        })}

        {/* Desks + agents (rendered after floor for proper z order) */}
        {tiles
          .filter((t) => t.agent)
          .sort((a, b) => a.x + a.y - (b.x + b.y))
          .map((tile, i) => {
            const agent = tile.agent!;
            const seed = AGENTS_BY_ID[agent.agentId];
            const status = statuses[agent.agentId] ?? "idle";
            const pos = isoTransform(tile.x, tile.y);
            const isHovered = hovered === agent.agentId;
            const isSelected = selectedAgentId === agent.agentId;
            const bobOffset =
              (tickRef.current + i) % 4 === 0 ? -2 : 0;
            const deskColor = DESK_COLORS[agent.deskColor] ?? DESK_COLORS.oak;
            const plantColor = PLANT_COLORS[agent.deskPlant] ?? PLANT_COLORS.monstera;

            return (
              <button
                key={agent.id}
                onClick={() => onAgentClick?.(agent.agentId)}
                onMouseEnter={() => setHovered(agent.agentId)}
                onMouseLeave={() => setHovered(null)}
                className="absolute group focus:outline-none"
                style={{
                  ...pos,
                  width: TILE,
                  height: TILE * 1.4,
                  zIndex: 10 + tile.x + tile.y,
                  cursor: "pointer",
                }}
              >
                {/* Hover spotlight */}
                {(isHovered || isSelected) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute"
                    style={{
                      left: -TILE * 0.4,
                      top: -TILE * 0.2,
                      width: TILE * 1.8,
                      height: TILE * 1.8,
                      background: `radial-gradient(circle, hsl(${seed.accent} / 0.18) 0%, transparent 60%)`,
                      pointerEvents: "none",
                    }}
                  />
                )}

                {/* Desk top — diamond */}
                <div
                  className="absolute shadow-md"
                  style={{
                    width: TILE * 0.85,
                    height: TILE * 0.85,
                    transform: `rotate(45deg) scale(${ISO_X}, ${ISO_Y})`,
                    transformOrigin: "0 0",
                    left: TILE * 0.5,
                    top: TILE * 0.45,
                    background: deskColor,
                    border: `1px solid ${
                      isSelected ? `hsl(${seed.accent})` : "hsl(220 15% 60% / 0.4)"
                    }`,
                    boxShadow: isSelected
                      ? `0 0 0 2px hsl(${seed.accent} / 0.5)`
                      : undefined,
                  }}
                />

                {/* Desk side faces (for depth) */}
                <div
                  className="absolute"
                  style={{
                    width: TILE * 0.6,
                    height: TILE * 0.18,
                    background: `hsl(${seed.accent} / 0.15)`,
                    left: TILE * 0.2,
                    top: TILE * 0.85,
                    transform: "skewY(-30deg)",
                    transformOrigin: "0 0",
                    borderTop: "1px solid hsl(220 15% 60% / 0.3)",
                  }}
                />

                {/* Plant */}
                {agent.deskPlant !== "none" && (
                  <div
                    className="absolute"
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: plantColor,
                      left: TILE * 0.18,
                      top: TILE * 0.4,
                      boxShadow: "0 1px 2px hsl(220 30% 20% / 0.3)",
                    }}
                  />
                )}

                {/* Agent portrait — head & shoulders, slight bob on idle tick */}
                <motion.div
                  animate={{
                    y: bobOffset,
                  }}
                  transition={{ duration: 1.6, ease: "easeInOut" }}
                  className="absolute"
                  style={{
                    left: TILE * 0.25,
                    top: -TILE * 0.05,
                    width: TILE * 0.7,
                    height: TILE * 0.85,
                    backgroundImage: `url(${seed.portrait})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center top",
                    filter:
                      status === "idle"
                        ? undefined
                        : `drop-shadow(0 0 8px hsl(${seed.accent} / 0.6))`,
                  }}
                />

                {/* Status dot */}
                <span
                  className="absolute rounded-full"
                  style={{
                    left: TILE * 0.78,
                    top: TILE * 0.5,
                    width: 8,
                    height: 8,
                    background: STATUS_COLOR[status],
                    boxShadow: `0 0 0 2px hsl(0 0% 100%), 0 0 8px ${STATUS_COLOR[status]}`,
                  }}
                />

                {/* Hover label — fades in */}
                {(isHovered || (showLabels && !compact)) && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease }}
                    className="absolute pointer-events-none"
                    style={{
                      left: TILE * 0.5,
                      top: TILE * 1.15,
                      transform: "translateX(-50%)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div className="bg-foreground text-background rounded-md px-2.5 py-1.5 shadow-lg text-[11px] font-medium">
                      <div>{agent.customName ?? seed.defaultName}</div>
                      <div className="font-mono text-[9px] opacity-70 mt-0.5 tracking-wider">
                        {seed.role} · {status.toUpperCase()}
                      </div>
                    </div>
                  </motion.div>
                )}
              </button>
            );
          })}
      </div>

      {/* Empty office hint */}
      {hired.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center max-w-[260px] px-4">
            <p className="text-[13px] text-muted-foreground">
              Your office is empty. Hire your first specialist to get started.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeScene;
