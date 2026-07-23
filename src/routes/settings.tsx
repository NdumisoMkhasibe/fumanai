import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { clearAll } from "@/lib/profiles";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — FumanAI" },
      { name: "description", content: "Manage appearance, privacy, and local data for FumanAI." },
      { property: "og:title", content: "Settings — FumanAI" },
      { property: "og:description", content: "Appearance, privacy, and local data." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:py-14 space-y-4">
      <h1 className="text-3xl font-semibold md:text-4xl">Settings</h1>
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Privacy</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          FumanAI stores all your profiles in this browser's local storage. Nothing is sent to a server except the job advertisement and profile fields when you actively generate an application.
        </p>
      </Card>
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Responsible AI</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          FumanAI is instructed never to fabricate qualifications, employers, or dates. Always review generated documents before sending.
        </p>
      </Card>
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-destructive">Clear local data</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Delete every profile from this browser. This cannot be undone.
        </p>
        <Button
          variant="destructive"
          className="mt-4"
          onClick={() => {
            if (confirm("Delete all local profiles?")) {
              clearAll();
              toast.success("Local data cleared");
            }
          }}
        >
          Clear all data
        </Button>
      </Card>
      <Card className="p-6">
        <h2 className="text-lg font-semibold">About</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          <strong className="text-foreground">FumanAI</strong> — Your Autonomous Dream Job Assistant. Built with a local-first, no-sign-up approach.
        </p>
      </Card>
    </div>
  );
}