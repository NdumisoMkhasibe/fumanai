import { z } from "zod";

import {
  runAITask,
} from "@/lib/ai-api";


export const EmailToneSchema =
  z.enum([
    "Professional",
    "Friendly",
    "Formal",
    "Concise",
    "Persuasive",
    "Apologetic",
  ]);


export type EmailTone =
  z.infer<
    typeof EmailToneSchema
  >;


const EmailInputSchema =
  z.object({
    purpose:
      z.string().min(3),

    recipient:
      z.string(),

    tone:
      EmailToneSchema,

    context:
      z.string(),

    senderName:
      z.string(),
  });


const EmailResultSchema =
  z.object({
    subject:
      z.string(),

    body:
      z.string(),
  });


export type GenerateEmailInput =
  z.infer<
    typeof EmailInputSchema
  >;


export type GeneratedEmail =
  z.infer<
    typeof EmailResultSchema
  >;


export async function generateEmail(
  input:
    GenerateEmailInput,

  accessToken:
    string
): Promise<GeneratedEmail> {
  const validatedInput =
    EmailInputSchema.parse(
      input
    );


  const response =
    await runAITask<
      unknown,
      GenerateEmailInput
    >(
      "generate-email",
      validatedInput,
      accessToken
    );


  const parsed =
    EmailResultSchema.safeParse(
      response
    );


  if (!parsed.success) {
    console.error(
      "Invalid Email Generator response:",
      parsed.error
    );

    throw new Error(
      "AI returned invalid email data"
    );
  }


  return parsed.data;
}