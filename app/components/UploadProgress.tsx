"use client";

import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UploadProgressProps {
  isUploading: boolean;
  progress?: number;
  fileName?: string;
  className?: string;
}

export function UploadProgress({
  isUploading,
  progress = 0,
  fileName,
  className
}: UploadProgressProps) {
  if (!isUploading) return null;

  return (
    <div className={cn(
      "flex items-center gap-3 p-4 bg-muted/50 rounded-lg border",
      className
    )}>
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium truncate">
            {fileName ? `Uploading ${fileName}...` : "Uploading..."}
          </p>
          <span className="text-xs text-muted-foreground">
            {progress}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1">
          Please don&apos;t close this window
        </p>
      </div>
    </div>
  );
}
