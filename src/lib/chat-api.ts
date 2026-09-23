import { z } from "zod";

import {
  runAITask,
} from "@/lib/ai-api";


const ChatMessageSchema =
  z.object({
    role:
      z.enum([
        "user",
        "assistant",
      ]),

    content:
      z.string().min(1),
  });


const ChatInputSchema =
  z.object({
    messages:
      z.array(
        ChatMessageSchema
      ).min(1),
  });


const ChatResultSchema =
  z.object({
    reply:
      z.string(),
  });


export type ChatMessage =
  z.infer<
    typeof ChatMessageSchema
  >;


export type ChatInput =
  z.infer<
    typeof ChatInputSchema
  >;


export async function chatReply(
  input:
    ChatInput,

  accessToken:
    string
): Promise<{
  reply: string;
}> {
  const validatedInput =
    ChatInputSchema.parse(
      input
    );


  const response =
    await runAITask<
      unknown,
      ChatInput
    >(
      "chat",
      validatedInput,
      accessToken
    );


  const parsed =
    ChatResultSchema.safeParse(
      response
    );


  if (!parsed.success) {
    console.error(
      "Invalid Chat response:",
      parsed.error
    );


    throw new Error(
      "AI returned invalid chat data"
    );
  }


  return parsed.data;
}