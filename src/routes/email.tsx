import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — FumanAI" },
      { name: "description", content: "Generate polished emails with tone control in seconds." },
      { property: "og:title", content: "Smart Email Generator — FumanAI" },
      { property: "og:description", content: "Tone-aware email drafting." },
    ],
  }),
  component: () => <ComingSoon title="Smart Email Generator" description="Pick a tone, describe what you want to say, and get a polished subject and body." />,
});