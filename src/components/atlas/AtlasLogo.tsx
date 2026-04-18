const AtlasLogo = ({ size = "default" }: { size?: "default" | "large" }) => {
  const dot = size === "large" ? "w-3 h-3" : "w-2 h-2";
  const textSize = size === "large" ? "text-[22px]" : "text-[15px]";

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="relative flex items-center justify-center">
        <div className={`${dot} rounded-[2px] bg-foreground`} />
        <div className={`${dot} absolute -right-1 -bottom-1 rounded-[2px] bg-accent`} />
      </div>
      <span className={`${textSize} font-display font-semibold text-foreground tracking-[-0.02em] leading-none`}>
        Atlas
      </span>
    </div>
  );
};

export default AtlasLogo;
