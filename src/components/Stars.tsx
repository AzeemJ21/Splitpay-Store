import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({ rating, className }: { rating: number; className?: string }) {
  const full = Math.floor(rating);
  const partial = rating - full >= 0.5;
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < full
              ? "fill-brand-orange text-brand-orange"
              : i === full && partial
                ? "fill-brand-orange/50 text-brand-orange"
                : "text-store-card",
          )}
        />
      ))}
    </div>
  );
}
