import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  className?: string;
  message?: string;
  fullScreen?: boolean;
}

export const LoadingScreen = ({ 
  className, 
  message = "Loading...", 
  fullScreen = true 
}: LoadingScreenProps) => {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullScreen && "min-h-screen",
        !fullScreen && "p-8",
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};

export const LoadingSpinner = ({ className }: { className?: string }) => {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
};