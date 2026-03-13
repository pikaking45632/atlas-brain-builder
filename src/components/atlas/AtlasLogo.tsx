import atlasLogoImg from "@/assets/atlas-logo.png";

const AtlasLogo = ({ size = "default" }: { size?: "default" | "large" }) => {
  const imgSize = size === "large" ? "w-10 h-10" : "w-7 h-7";
  const textSize = size === "large" ? "text-2xl" : "text-lg";

  return (
    <div className="flex items-center gap-2">
      <img src={atlasLogoImg} alt="Atlas" className={imgSize} />
      <span className={`${textSize} font-display font-bold text-foreground tracking-tight`}>
        Atlas Intelligence Systems
      </span>
    </div>
  );
};

export default AtlasLogo;
