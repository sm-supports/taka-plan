"use client";
/** Red-tinted card for a failed load or calculation with an optional retry button. */
import { Button } from "./Button";

export interface ErrorCardProps {
  title: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorCard({ title, message, onRetry, retryLabel = "Retry" }: ErrorCardProps) {
  return (
    <div role="alert" className="rounded-card border border-status-red/30 bg-status-red-soft p-4">
      <h2 dir="auto" className="text-base font-semibold text-status-red">
        {title}
      </h2>
      <p dir="auto" className="mt-1 text-sm text-text">
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" className="mt-3" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
