import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { generateEmail } from "@/lib/tools.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — FumanAI" },
      { name: "description", content: "Generate polished emails with tone control in seconds." },
      { property: "og:title", content: "Smart Email Generator — FumanAI" },
      { property: "og:description", content: "Tone-aware email drafting." },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Professional", "Friendly", "Formal", "Concise", "Persuasive", "Apologetic"] as const;

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button variant="outline" size="sm" onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}>
      {ok ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}{ok ? "Copied" : "Copy"}
    </Button>
  );
}

function EmailPage() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [senderName, setSenderName] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Professional");
  const [context, setContext] = useState("");
  const fn = useServerFn(generateEmail);
  const m = useMutation({
    mutationFn: () => fn({ data: { purpose, recipient, senderName, tone, context } }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to generate."),
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
      <h1 className="text-3xl font-semibold md:text-4xl">Smart Email Generator</h1>
      <p className="mt-2 text-muted-foreground">Describe what you want to say and pick a tone. FumanAI drafts a polished subject and body.</p>

      <Card className="mt-6 space-y-4 p-6">
        <div>
          <label className="text-sm font-medium">What is this email about?</label>
          <Input className="mt-1" placeholder="e.g. Follow up after interview at Acme" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Recipient</label>
            <Input className="mt-1" placeholder="e.g. Sarah, Hiring Manager" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Your name</label>
            <Input className="mt-1" placeholder="e.g. Alex Doe" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Tone</label>
          <Select value={tone} onValueChange={(v) => setTone(v as (typeof TONES)[number])}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Details / context</label>
          <Textarea rows={6} className="mt-1" placeholder="Any key points, background, or specifics to include…" value={context} onChange={(e) => setContext(e.target.value)} />
        </div>
        <div className="flex justify-end">
          <Button disabled={purpose.trim().length < 3 || m.isPending} onClick={() => m.mutate()}>
            {m.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Drafting…</> : "Generate email"}
          </Button>
        </div>
      </Card>

      {m.data && (
        <Card className="mt-6 space-y-4 p-6 animate-in fade-in duration-500">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Subject</label>
              <CopyBtn text={m.data.subject} />
            </div>
            <div className="mt-1 rounded border bg-muted/30 px-3 py-2 text-sm">{m.data.subject}</div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Body</label>
              <CopyBtn text={m.data.body} />
            </div>
            <div className="mt-1 whitespace-pre-wrap rounded border bg-muted/30 px-3 py-3 text-sm leading-relaxed">{m.data.body}</div>
          </div>
        </Card>
      )}
    </div>
  );
}