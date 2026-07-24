import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import {
  TRACKER_COLUMNS,
  type TrackerColumn,
  useTracker,
  addJobCard,
  moveJobCard,
  deleteJobCard,
} from "@/lib/tracker";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "Job Tracker — FumanAI" },
      { name: "description", content: "Track every application on a Kanban board — from Applied to Hired." },
      { property: "og:title", content: "Job Tracker — FumanAI" },
      { property: "og:description", content: "Kanban board for every application." },
    ],
  }),
  component: TrackerPage,
});

function TrackerPage() {
  const { cards, hydrated } = useTracker();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<TrackerColumn | null>(null);

  if (!hydrated) return <div className="p-12" />;

  const onDrop = (col: TrackerColumn) => {
    if (dragId) moveJobCard(dragId, col);
    setDragId(null);
    setOverCol(null);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10 md:py-14">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold md:text-4xl">Job Tracker</h1>
          <p className="mt-2 text-muted-foreground">
            Drag applications between stages. Applications you generate with FumanAI land in <span className="font-medium text-foreground">Applied</span> automatically.
          </p>
        </div>
        <AddCardDialog />
      </div>

      <div className="mt-8 grid grid-flow-col auto-cols-[minmax(260px,1fr)] gap-4 overflow-x-auto pb-4">
        {TRACKER_COLUMNS.map((col) => {
          const colCards = cards.filter((c) => c.column === col);
          const isOver = overCol === col;
          return (
            <div
              key={col}
              className={`rounded-lg border bg-muted/30 p-3 transition-colors ${isOver ? "border-primary bg-primary/5" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(col);
              }}
              onDragLeave={() => setOverCol((c) => (c === col ? null : c))}
              onDrop={() => onDrop(col)}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold">{col}</h2>
                <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">{colCards.length}</span>
              </div>
              <div className="space-y-2">
                {colCards.map((c) => (
                  <Card
                    key={c.id}
                    draggable
                    onDragStart={() => setDragId(c.id)}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverCol(null);
                    }}
                    className={`cursor-grab p-3 active:cursor-grabbing ${dragId === c.id ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{c.title}</div>
                        <div className="truncate text-sm text-muted-foreground">{c.company}</div>
                        <div className="truncate text-xs text-muted-foreground">{c.location}</div>
                      </div>
                      <button
                        onClick={() => deleteJobCard(c.id)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Delete card"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Match {c.matchScore.toFixed(1)} / 10
                    </div>
                  </Card>
                ))}
                {colCards.length === 0 && (
                  <div className="rounded border border-dashed p-4 text-center text-xs text-muted-foreground">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddCardDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [score, setScore] = useState("7.0");

  const submit = () => {
    addJobCard({ title, company, location, matchScore: Number(score) || 0 });
    setTitle("");
    setCompany("");
    setLocation("");
    setScore("7.0");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-1 h-4 w-4" /> Add application</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add application</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Job title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Product Designer" />
          </div>
          <div>
            <label className="text-sm font-medium">Company</label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Corp" />
          </div>
          <div>
            <label className="text-sm font-medium">Location</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Remote, London" />
          </div>
          <div>
            <label className="text-sm font-medium">Match score (0–10)</label>
            <Input type="number" step="0.1" min="0" max="10" value={score} onChange={(e) => setScore(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!title.trim() || !company.trim()}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}