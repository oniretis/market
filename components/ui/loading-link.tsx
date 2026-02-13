"use client";

import Link from "next/link";
import { useNavigationLoading } from "@/app/lib/use-navigation-loading";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface LoadingLinkProps extends React.ComponentProps<typeof Link> {
  loadingMessage?: string;
  showSpinner?: boolean;
}

export function LoadingLink({ 
  href, 
  children, 
  loadingMessage = "Loading...",
  showSpinner = true,
  className,
  onClick,
  ...props 
}: LoadingLinkProps) {
  const { navigateWithLoading } = useNavigationLoading();
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (isClicked) return; // Prevent multiple clicks
    
    setIsClicked(true);
    onClick?.(e);
    
    navigateWithLoading(href.toString(), loadingMessage);
    
    // Reset after a short delay
    setTimeout(() => setIsClicked(false), 1000);
  };

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 transition-all",
        isClicked && "opacity-70",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {isClicked && showSpinner && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}
      {children}
    </Link>
  );
}
