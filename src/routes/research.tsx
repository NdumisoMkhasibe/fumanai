import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { runResearch } from "@/lib/tools.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — FumanAI" },
      { name: "description", content: "Summarize articles, generate insights, and get recommendations." },
      { property: "og:title", content: "AI Research Assistant — FumanAI" },
      { property: "og:description", content: "Summaries, insights, recommendations." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const fn = useServerFn(runResearch);
  const m = useMutation({
    mutationFn: () => fn({ data: { topic } }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to research."),
  });
  const r = m.data;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
      <h1 className="text-3xl font-semibold md:text-4xl">AI Research Assistant</h1>
      <p className="mt-2 text-muted-foreground">Paste an article or type a topic. Get a summary, key insights, recommendations, and follow-ups.</p>

      <Card className="mt-6 p-6">
        <label className="text-sm font-medium">Topic or article</label>
        <Textarea rows={10} className="mt-1" placeholder="e.g. 'Latest trends in AI hiring' or paste article text…" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <div className="mt-4 flex justify-end">
          <Button disabled={topic.trim().length < 3 || m.isPending} onClick={() => m.mutate()}>
            {m.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Researching…</> : "Research"}
          </Button>
        </div>
      </Card>

      {r && (
        <div className="mt-6 space-y-4 animate-in fade-in duration-500">
          <Card className="p-6">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Summary</h3>
            <p className="mt-2 leading-relaxed">{r.summary}</p>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Key insights</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">{r.keyInsights.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </Card>
            <Card className="p-6">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Recommendations</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">{r.recommendations.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </Card>
          </div>
          <Card className="p-6">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Follow-up questions</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">{r.followUpQuestions.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </Card>
        </div>
      )}
    </div>
  );
}