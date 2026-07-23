import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — FumanAI" },
      { name: "description", content: "A general-purpose AI assistant built into FumanAI." },
      { property: "og:title", content: "AI Chat — FumanAI" },
      { property: "og:description", content: "General-purpose AI assistant." },
    ],
  }),
  component: () => <ComingSoon title="AI Chat" description="Your FumanAI companion for anything else you need — brainstorming, prep, negotiation help." />,
});