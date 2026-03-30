import atlasLogoImg from "@/assets/atlas-logo.png";

const AtlasLogo = ({ size = "default" }: { size?: "default" | "large" }) => {
  const imgSize = size === "large" ? "w-10 h-10" : "w-6 h-6";
  const textSize = size === "large" ? "text-xl" : "text-[15px]";

  return (
    <div className="flex items-center gap-2.5">
      <img src={atlasLogoImg} alt="Atlas" className={`${imgSize} drop-shadow-[0_0_8px_hsl(var(--primary)/0.3)]`} />
      <span className={`${textSize} font-display font-semibold text-foreground tracking-tight`}>
        Atlas
      </span>
    </div>
  );
};

export default AtlasLogo;
