import { createFileRoute, Link } from "@tanstack/react-router";
import { useProfiles, getActive } from "@/lib/profiles";
import { Onboarding } from "@/components/onboarding";
import { Card } from "@/components/ui/card";
import { FileText, UserCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FumanAI — Home" },
      { name: "description", content: "Start a tailored job application in seconds. FumanAI drafts ATS-friendly CVs, cover letters, and outreach emails from your local profile." },
      { property: "og:title", content: "FumanAI — Home" },
      { property: "og:description", content: "Start a tailored job application in seconds. FumanAI drafts ATS-friendly CVs, cover letters, and outreach emails from your local profile." },
    ],
  }),
  component: Index,
});

function Index() {
  const { profiles, hydrated } = useProfiles();
  if (!hydrated) return <div className="p-12" />;

  if (profiles.length === 0) {
    return <Onboarding onDone={() => window.location.reload()} />;
  }

  const active = getActive() ?? profiles[0];

  return (
    <div className="mx-auto max-w-5xl px-6 py-14 md:py-20">
      <div className="mb-2 text-sm uppercase tracking-wider text-muted-foreground">Welcome back</div>
      <h1 className="text-4xl font-semibold md:text-5xl">
        Hello, {active.name.split(" ")[0] || "there"}.
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Your autonomous dream job assistant is ready. Paste a job advertisement and I'll draft an ATS-friendly CV, cover letter, and application email tailored to it.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-1">
        <Link to="/job" className="group">
          <Card className="flex items-center justify-between gap-4 p-6 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="font-[Poppins] text-lg font-semibold">Paste Job Advertisement</div>
                <div className="text-sm text-muted-foreground">
                  Generate a CV, cover letter, and application email in seconds.
                </div>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </Card>
        </Link>

        <Link to="/profiles" className="group">
          <Card className="flex items-center justify-between gap-4 p-6 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <UserCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="font-[Poppins] text-lg font-semibold">Manage Profiles</div>
                <div className="text-sm text-muted-foreground">
                  {profiles.length} profile{profiles.length === 1 ? "" : "s"} — one career path each. Active: {active.targetRole || active.name}.
                </div>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </Card>
        </Link>
      </div>
    </div>
  );
}
