import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { summarizeNotes } from "@/lib/tools.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — FumanAI" },
      { name: "description", content: "Summarize meetings and extract action items, decisions, and deadlines." },
      { property: "og:title", content: "Meeting Notes Summarizer — FumanAI" },
      { property: "og:description", content: "Summaries, action items, decisions, deadlines." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const [notes, setNotes] = useState("");
  const fn = useServerFn(summarizeNotes);
  const m = useMutation({
    mutationFn: () => fn({ data: { notes } }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to summarize."),
  });
  const r = m.data;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
      <h1 className="text-3xl font-semibold md:text-4xl">Meeting Notes Summarizer</h1>
      <p className="mt-2 text-muted-foreground">Paste raw notes or a transcript. Get a clean summary plus action items, decisions, and deadlines.</p>

      <Card className="mt-6 p-6">
        <label className="text-sm font-medium">Raw notes</label>
        <Textarea rows={12} className="mt-1" placeholder="Paste meeting notes or a transcript…" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="mt-4 flex justify-end">
          <Button disabled={notes.trim().length < 20 || m.isPending} onClick={() => m.mutate()}>
            {m.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing…</> : "Summarize"}
          </Button>
        </div>
      </Card>

      {r && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 animate-in fade-in duration-500">
          <Card className="p-6 md:col-span-2">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Summary</h3>
            <p className="mt-2 leading-relaxed">{r.summary}</p>
          </Card>
          <Card className="p-6 md:col-span-2">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Action items</h3>
            {r.actionItems.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">None identified.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {r.actionItems.map((a, i) => (
                  <li key={i} className="rounded border bg-muted/30 px-3 py-2 text-sm">
                    <div className="font-medium">{a.task}</div>
                    <div className="text-xs text-muted-foreground">Owner: {a.owner} · Due: {a.due}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="p-6">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Decisions</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">{r.decisions.map((d, i) => <li key={i}>{d}</li>)}</ul>
          </Card>
          <Card className="p-6">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Deadlines</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">{r.deadlines.map((d, i) => <li key={i}>{d}</li>)}</ul>
          </Card>
        </div>
      )}
    </div>
  );
}