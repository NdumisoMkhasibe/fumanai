import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useProfiles, saveProfile, deleteProfile, setActive, type Profile } from "@/lib/profiles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Star, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profiles")({
  head: () => ({
    meta: [
      { title: "Profiles — FumanAI" },
      { name: "description", content: "Manage the local career profiles FumanAI uses to tailor your applications. One profile per career path." },
      { property: "og:title", content: "Profiles — FumanAI" },
      { property: "og:description", content: "Manage local career profiles for tailored applications." },
    ],
  }),
  component: ProfilesPage,
});

const FIELDS: Array<{ key: keyof Omit<Profile, "id" | "createdAt" | "updatedAt">; label: string; type: "input" | "textarea" }> = [
  { key: "name", label: "Full name", type: "input" },
  { key: "email", label: "Email", type: "input" },
  { key: "phone", label: "Phone", type: "input" },
  { key: "targetRole", label: "Target role / career path", type: "input" },
  { key: "summary", label: "Professional summary", type: "textarea" },
  { key: "education", label: "Education", type: "textarea" },
  { key: "skills", label: "Core skills", type: "textarea" },
  { key: "experience", label: "Work experience", type: "textarea" },
  { key: "extras", label: "Additional information", type: "textarea" },
];

function emptyForm(): Omit<Profile, "id" | "createdAt" | "updatedAt"> {
  return { name: "", email: "", phone: "", targetRole: "", summary: "", education: "", skills: "", experience: "", extras: "" };
}

function ProfileForm({ initial, onSave, onCancel }: { initial?: Profile; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState(() => {
    if (!initial) return emptyForm();
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = initial;
    return rest;
  });
  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {FIELDS.map((f) => (
        <div key={f.key}>
          <Label htmlFor={f.key}>{f.label}</Label>
          {f.type === "input" ? (
            <Input
              id={f.key}
              className="mt-1"
              value={form[f.key]}
              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
            />
          ) : (
            <Textarea
              id={f.key}
              className="mt-1"
              rows={3}
              value={form[f.key]}
              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
            />
          )}
        </div>
      ))}
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => {
            if (!form.name.trim()) return toast.error("Name required");
            saveProfile(initial ? { ...form, id: initial.id } : form);
            toast.success("Saved");
            onSave();
          }}
        >
          Save profile
        </Button>
      </DialogFooter>
    </div>
  );
}

function ProfilesPage() {
  const { profiles, activeId, hydrated } = useProfiles();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);

  if (!hydrated) return <div className="p-12" />;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold md:text-4xl">Profiles</h1>
          <p className="mt-2 text-sm text-muted-foreground">One profile = one career path. Everything stays in this browser.</p>
        </div>
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />New profile</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Create profile</DialogTitle></DialogHeader>
            <ProfileForm onSave={() => setCreating(false)} onCancel={() => setCreating(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 grid gap-3">
        {profiles.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            No profiles yet. Create one to get started.
          </Card>
        )}
        {profiles.map((p) => (
          <Card key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="font-[Poppins] text-lg font-semibold">{p.name || "(unnamed)"}</div>
                {p.id === activeId && <Badge className="bg-accent text-accent-foreground hover:bg-accent">Active</Badge>}
              </div>
              <div className="text-sm text-muted-foreground truncate">{p.targetRole || "No target role set"}</div>
            </div>
            <div className="flex gap-2">
              {p.id !== activeId && (
                <Button size="sm" variant="outline" onClick={() => { setActive(p.id); toast.success("Active profile switched"); }}>
                  <Star className="mr-1 h-3.5 w-3.5" />Set active
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setEditing(p)}>
                <Pencil className="mr-1 h-3.5 w-3.5" />Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (confirm(`Delete profile "${p.name}"?`)) { deleteProfile(p.id); toast.success("Deleted"); }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit profile</DialogTitle></DialogHeader>
          {editing && <ProfileForm initial={editing} onSave={() => setEditing(null)} onCancel={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}