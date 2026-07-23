import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — FumanAI" },
      { name: "description", content: "Summarize meetings and extract action items, decisions, and deadlines." },
      { property: "og:title", content: "Meeting Notes Summarizer — FumanAI" },
      { property: "og:description", content: "Summaries, action items, decisions, deadlines." },
    ],
  }),
  component: () => <ComingSoon title="Meeting Notes Summarizer" description="Paste raw notes and get a clean summary plus action items, decisions, and deadlines." />,
});