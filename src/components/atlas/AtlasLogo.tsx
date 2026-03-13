import { Brain } from "lucide-react";

const AtlasLogo = ({ size = "default" }: { size?: "default" | "large" }) => {
  const iconSize = size === "large" ? "w-8 h-8" : "w-5 h-5";
  const textSize = size === "large" ? "text-2xl" : "text-lg";

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Brain className={`${iconSize} text-primary`} />
        <div className="absolute inset-0 blur-md bg-primary/30 rounded-full" />
      </div>
      <span className={`${textSize} font-display font-bold text-foreground tracking-tight`}>
        Atlas
      </span>
    </div>
  );
};

export default AtlasLogo;
