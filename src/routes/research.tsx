import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — FumanAI" },
      { name: "description", content: "Summarize articles, generate insights, and get recommendations." },
      { property: "og:title", content: "AI Research Assistant — FumanAI" },
      { property: "og:description", content: "Summaries, insights, recommendations." },
    ],
  }),
  component: () => <ComingSoon title="AI Research Assistant" description="Drop in an article or topic and get a clean summary with insights and recommendations." />,
});