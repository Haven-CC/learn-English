// Placeholder component for future ad integration

export function AdSlot({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-lg border-2 border-dashed border-muted bg-muted/20 p-4 text-center text-sm text-muted-foreground ${className}`}
    >
      Ad Space
    </div>
  )
}
