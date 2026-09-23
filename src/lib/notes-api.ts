import { z } from "zod";

import {
  runAITask,
} from "@/lib/ai-api";


const NotesInputSchema =
  z.object({
    notes:
      z.string().min(20),
  });


const ActionItemSchema =
  z.object({
    task:
      z.string(),

    owner:
      z.string(),

    due:
      z.string(),
  });


const NotesResultSchema =
  z.object({
    summary:
      z.string(),

    actionItems:
      z.array(
        ActionItemSchema
      ),

    decisions:
      z.array(
        z.string()
      ),

    deadlines:
      z.array(
        z.string()
      ),
  });


export type SummarizeNotesInput =
  z.infer<
    typeof NotesInputSchema
  >;


export type GeneratedNotes =
  z.infer<
    typeof NotesResultSchema
  >;


export async function summarizeNotes(
  input:
    SummarizeNotesInput,

  accessToken:
    string
): Promise<GeneratedNotes> {
  const validatedInput =
    NotesInputSchema.parse(
      input
    );


  const response =
    await runAITask<
      unknown,
      SummarizeNotesInput
    >(
      "summarize-notes",
      validatedInput,
      accessToken
    );


  const parsed =
    NotesResultSchema.safeParse(
      response
    );


  if (!parsed.success) {
    console.error(
      "Invalid Meeting Notes response:",
      parsed.error
    );


    throw new Error(
      "AI returned invalid meeting notes data"
    );
  }


  return parsed.data;
}