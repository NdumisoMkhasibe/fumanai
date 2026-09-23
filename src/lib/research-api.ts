import { z } from "zod";

import {
  runAITask,
} from "@/lib/ai-api";


const ResearchInputSchema =
  z.object({
    topic:
      z.string().min(3),
  });


const ResearchResultSchema =
  z.object({
    summary:
      z.string(),

    keyInsights:
      z.array(
        z.string()
      ),

    recommendations:
      z.array(
        z.string()
      ),

    followUpQuestions:
      z.array(
        z.string()
      ),
  });


export type RunResearchInput =
  z.infer<
    typeof ResearchInputSchema
  >;


export type GeneratedResearch =
  z.infer<
    typeof ResearchResultSchema
  >;


export async function runResearch(
  input:
    RunResearchInput,

  accessToken:
    string
): Promise<GeneratedResearch> {
  const validatedInput =
    ResearchInputSchema.parse(
      input
    );


  const response =
    await runAITask<
      unknown,
      RunResearchInput
    >(
      "run-research",
      validatedInput,
      accessToken
    );


  const parsed =
    ResearchResultSchema.safeParse(
      response
    );


  if (!parsed.success) {
    console.error(
      "Invalid Research response:",
      parsed.error
    );


    throw new Error(
      "AI returned invalid research data"
    );
  }


  return parsed.data;
}