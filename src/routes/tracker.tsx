import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "Job Tracker — FumanAI" },
      { name: "description", content: "Track every application on a Kanban board — from Applied to Hired." },
      { property: "og:title", content: "Job Tracker — FumanAI" },
      { property: "og:description", content: "Kanban board for every application." },
    ],
  }),
  component: () => <ComingSoon title="Job Tracker" description="A drag-and-drop Kanban board for every stage — Applied, No Response, Online Assessment, Interview, Offer, Hired, Declined." />,
});