import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

interface EnhancedLoadingProps {
  message?: string;
  submessage?: string;
  progress?: number;
  className?: string;
  variant?: "full" | "inline" | "card";
}

export const EnhancedLoading = ({ 
  message = "Loading...", 
  submessage,
  progress,
  className,
  variant = "inline"
}: EnhancedLoadingProps) => {
  const LoadingContent = () => (
    <div className={cn(
      "flex flex-col items-center justify-center gap-4",
      variant === "full" && "min-h-screen",
      variant === "inline" && "p-8",
      className
    )}>
      <div className="relative">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-foreground">{message}</p>
        {submessage && (
          <p className="text-xs text-muted-foreground">{submessage}</p>
        )}
      </div>
      
      {progress !== undefined && (
        <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );

  if (variant === "card") {
    return (
      <Card className="border-dashed">
        <LoadingContent />
      </Card>
    );
  }

  return <LoadingContent />;
};

export const LoadingOverlay = ({ 
  isVisible, 
  message = "Processing...",
  className 
}: { 
  isVisible: boolean; 
  message?: string; 
  className?: string;
}) => {
  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center",
      className
    )}>
      <Card className="p-6">
        <EnhancedLoading message={message} variant="inline" />
      </Card>
    </div>
  );
};