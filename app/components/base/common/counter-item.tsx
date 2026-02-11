import { cn } from "@/lib/utils";

interface CounterItemProps {
  value: string;
  label: string;
  extraTop?: boolean;
  className?: string;
}

export default function CounterItemComponent({
  value,
  label,
  extraTop = false,
  className
}: CounterItemProps) {
  return (
    <div className={cn("text-center p-4", extraTop && "pt-8", className)}>
      <div className="text-2xl font-bold text-primary">
        {value}
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  );
}
