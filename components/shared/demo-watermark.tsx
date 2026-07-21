import { FlaskConical } from "lucide-react";

export function DemoWatermark() {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-card/90 px-3 py-1.5 text-xs text-muted-foreground shadow-lg backdrop-blur-sm">
        <FlaskConical className="size-3.5 text-primary" />
        <span>
          Demo <span className="text-border">·</span> datos ficticios
        </span>
      </div>
    </div>
  );
}
