import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";

async function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
  return createLovableAiGatewayProvider(key)("google/gemini-2.5-flash");
}

// ---------- Email ----------
const EmailInput = z.object({
  purpose: z.string().min(3),
  recipient: z.string(),
  tone: z.enum(["Professional", "Friendly", "Formal", "Concise", "Persuasive", "Apologetic"]),
  context: z.string(),
  senderName: z.string(),
});
const EmailResult = z.object({ subject: z.string(), body: z.string() });
export type GeneratedEmail = z.infer<typeof EmailResult>;

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => EmailInput.parse(v))
  .handler(async ({ data }) => {
    const model = await getModel();
    const { output } = await generateText({
      model,
      system:
        "You draft polished emails. Match the requested tone exactly. Return a clear subject and a well-structured body. Do not invent facts beyond the given context.",
      prompt: `Purpose: ${data.purpose}
Recipient: ${data.recipient || "(unspecified)"}
Sender: ${data.senderName || "(unspecified)"}
Tone: ${data.tone}
Context/details:
${data.context || "(none)"}

Write the email. Include a signoff using the sender's name if provided.`,
      output: Output.object({ schema: EmailResult }),
    });
    return output;
  });

// ---------- Meeting Notes ----------
const NotesInput = z.object({ notes: z.string().min(20) });
const NotesResult = z.object({
  summary: z.string(),
  actionItems: z.array(z.object({ task: z.string(), owner: z.string(), due: z.string() })),
  decisions: z.array(z.string()),
  deadlines: z.array(z.string()),
});
export type GeneratedNotes = z.infer<typeof NotesResult>;

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => NotesInput.parse(v))
  .handler(async ({ data }) => {
    const model = await getModel();
    const { output } = await generateText({
      model,
      system:
        "You are a meeting-notes analyst. Produce a concise summary (3-6 sentences), an action items list (task, owner, due — use 'Unassigned'/'TBD' when missing), a decisions list, and a deadlines list. Do not invent participants or dates.",
      prompt: `Raw meeting notes:\n${data.notes}`,
      output: Output.object({ schema: NotesResult }),
    });
    return output;
  });

// ---------- Research ----------
const ResearchInput = z.object({ topic: z.string().min(3) });
const ResearchResult = z.object({
  summary: z.string(),
  keyInsights: z.array(z.string()),
  recommendations: z.array(z.string()),
  followUpQuestions: z.array(z.string()),
});
export type GeneratedResearch = z.infer<typeof ResearchResult>;

export const runResearch = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => ResearchInput.parse(v))
  .handler(async ({ data }) => {
    const model = await getModel();
    const { output } = await generateText({
      model,
      system:
        "You are a research assistant. Given a topic or pasted article, produce a clear neutral summary, 4-7 key insights, 3-5 actionable recommendations, and 3-5 follow-up questions worth exploring. If given raw article text, summarize it faithfully; if only a topic, share widely-known context and clearly avoid fabricated statistics.",
      prompt: `Topic or article:\n${data.topic}`,
      output: Output.object({ schema: ResearchResult }),
    });
    return output;
  });

// ---------- Chat ----------
const ChatMsg = z.object({ role: z.enum(["user", "assistant"]), content: z.string() });
const ChatInput = z.object({ messages: z.array(ChatMsg).min(1) });
export type ChatMessage = z.infer<typeof ChatMsg>;

export const chatReply = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => ChatInput.parse(v))
  .handler(async ({ data }) => {
    const model = await getModel();
    const { text } = await generateText({
      model,
      system:
        "You are FumanAI, a friendly, capable assistant embedded in a job-seekers' app. Help with brainstorming, interview prep, negotiation, and general questions. Be concise and practical. Use markdown when helpful.",
      messages: data.messages.map((m) => ({ role: m.role, content: m.content })),
    });
    return { reply: text };
  });