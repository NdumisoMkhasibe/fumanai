import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { saveProfile } from "@/lib/profiles";
import { toast } from "sonner";

const STEPS = [
  { key: "name", q: "Great to meet you! What's your full name?", ph: "Ada Lovelace", type: "input" },
  { key: "email", q: "What's the best email for employers to reach you?", ph: "ada@example.com", type: "input" },
  { key: "phone", q: "And a phone number they can call?", ph: "+1 555 0100", type: "input" },
  { key: "targetRole", q: "What role or career path are you targeting?", ph: "Senior Frontend Engineer", type: "input" },
  { key: "summary", q: "In a sentence or two, how would you describe yourself professionally?", ph: "Frontend engineer with 6 years building accessible, performant web apps.", type: "textarea" },
  { key: "education", q: "Tell me about your education. Include institution, degree, and years.", ph: "BSc Computer Science, University of X, 2015–2019", type: "textarea" },
  { key: "skills", q: "List your core skills, comma-separated.", ph: "React, TypeScript, Node.js, GraphQL, Tailwind", type: "textarea" },
  { key: "experience", q: "Walk me through your recent work experience — roles, companies, dates, and key wins.", ph: "Senior Engineer at Acme, 2021–present. Led migration to React 19...", type: "textarea" },
  { key: "extras", q: "Anything else worth highlighting? Certifications, languages, open-source, awards.", ph: "AWS Certified. Fluent in Spanish.", type: "textarea" },
] as const;

type Key = (typeof STEPS)[number]["key"];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<Key, string>>({
    name: "", email: "", phone: "", targetRole: "", summary: "",
    education: "", skills: "", experience: "", extras: "",
  });

  const current = STEPS[step];
  const value = answers[current.key];
  const isLast = step === STEPS.length - 1;

  function next() {
    if (!value.trim() && current.key !== "extras") {
      toast.error("Please share something so I can help you.");
      return;
    }
    if (isLast) {
      saveProfile(answers);
      toast.success("Profile saved locally.");
      onDone();
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold md:text-4xl">Let me get to know you</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          I'll ask a few quick questions. Everything stays in this browser — no account needed.
        </p>
      </div>

      <Card className="p-6 md:p-8">
        <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </div>
        <Label className="text-lg font-medium leading-relaxed" htmlFor="answer">
          {current.q}
        </Label>
        <div className="mt-4">
          {current.type === "input" ? (
            <Input
              id="answer"
              autoFocus
              value={value}
              placeholder={current.ph}
              onChange={(e) => setAnswers((a) => ({ ...a, [current.key]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") next();
              }}
            />
          ) : (
            <Textarea
              id="answer"
              autoFocus
              rows={5}
              value={value}
              placeholder={current.ph}
              onChange={(e) => setAnswers((a) => ({ ...a, [current.key]: e.target.value }))}
            />
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Back
          </Button>
          <Button onClick={next}>
            {isLast ? "Save profile" : "Next"}
          </Button>
        </div>
      </Card>

      <div className="mt-6 flex justify-center gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-6 rounded-full transition-colors ${
              i <= step ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}