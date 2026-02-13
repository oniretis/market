import { Button } from "./button";
import { LoadingSpinner } from "./loading-spinner";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

interface LoadingButtonProps extends
  React.ComponentProps<"button">,
  VariantProps<typeof Button> {
  isLoading?: boolean;
  loadingText?: string;
}

export function LoadingButton({
  isLoading = false,
  loadingText,
  children,
  disabled,
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={isLoading || disabled}
      className={cn("relative", className)}
      variant={variant}
      size={size}
      asChild={asChild}
      {...props}
    >
      {isLoading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      {isLoading ? loadingText || "Loading..." : children}
    </Button>
  );
}
