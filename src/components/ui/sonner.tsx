import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      duration={3000}
      closeButton={false}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast cursor-pointer group-[.toaster]:bg-foreground group-[.toaster]:text-background group-[.toaster]:border-foreground group-[.toaster]:shadow-[0_10px_30px_-10px_rgba(10,22,40,0.45)] group-[.toaster]:rounded-md",
          description: "group-[.toast]:text-background/70",
          actionButton: "group-[.toast]:bg-accent group-[.toast]:text-accent-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
