/** Pulsing grey block used while the store hydrates or data loads. */
import { cn } from "./cn";

export interface SkeletonProps {
  className?: string;
  /** Renders a stack of blocks that looks like a page: header, big number, three cards. */
  page?: boolean;
}

export function Skeleton({ className, page }: SkeletonProps) {
  if (page) {
    return (
      <div className="flex flex-col gap-4 py-4" aria-busy="true" aria-live="polite">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-16 w-2/3 self-center" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    );
  }
  return <div className={cn("tp-pulse rounded-xl bg-line", className)} aria-hidden="true" />;
}
