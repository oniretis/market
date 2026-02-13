import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TagsProps {
  items: string[];
  className?: string;
  onItemClick?: (item: string) => void;
}

export default function Tags({ items, className, onItemClick }: TagsProps) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {items.map((item, index) => (
        <Button
          key={index}
          variant="ghost"
          className="@6xl:h-14 h-12 @6xl:px-6 py-3 text-lg"
          onClick={() => onItemClick?.(item)}
        >
          {item}
        </Button>
      ))}
    </div>
  );
}
