import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Card className="flex flex-col items-center gap-4 p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Coming soon</div>
      </Card>
    </div>
  );
}