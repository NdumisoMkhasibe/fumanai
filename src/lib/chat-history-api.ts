import { z } from "zod";


const API_BASE_URL =
  "https://rrg31ef4vj.execute-api.af-south-1.amazonaws.com";


const StoredChatMessageSchema =
  z.object({
    messageId:
      z.string(),

    role:
      z.enum([
        "user",
        "assistant",
      ]),

    content:
      z.string(),

    createdAt:
      z.string(),
  });


const GetChatMessagesResponseSchema =
  z.object({
    messages:
      z.array(
        StoredChatMessageSchema
      ),
  });


const SaveChatMessageResponseSchema =
  z.object({
    message:
      StoredChatMessageSchema,
  });


const ClearChatMessagesResponseSchema =
  z.object({
    deletedCount:
      z.number(),
  });


export type StoredChatMessage =
  z.infer<
    typeof StoredChatMessageSchema
  >;


export type ChatRole =
  StoredChatMessage["role"];


async function parseErrorMessage(
  response:
    Response
): Promise<string> {
  try {
    const body =
      await response.json();


    if (
      body &&
      typeof body.message ===
        "string"
    ) {
      return body.message;
    }
  } catch {
    // Ignore JSON parsing errors.
  }


  return `Request failed with status ${response.status}`;
}


export async function getChatMessages(
  accessToken:
    string
): Promise<
  StoredChatMessage[]
> {
  const response =
    await fetch(
      `${API_BASE_URL}/chat/messages`,
      {
        method:
          "GET",

        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      }
    );


  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(
        response
      )
    );
  }


  const data =
    await response.json();


  const parsed =
    GetChatMessagesResponseSchema.safeParse(
      data
    );


  if (!parsed.success) {
    console.error(
      "Invalid chat history response:",
      parsed.error
    );


    throw new Error(
      "Server returned invalid chat history data"
    );
  }


  return parsed.data.messages;
}


export async function saveChatMessage(
  role:
    ChatRole,

  content:
    string,

  accessToken:
    string
): Promise<
  StoredChatMessage
> {
  const response =
    await fetch(
      `${API_BASE_URL}/chat/messages`,
      {
        method:
          "POST",

        headers: {
          Authorization:
            `Bearer ${accessToken}`,

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            role,
            content,
          }),
      }
    );


  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(
        response
      )
    );
  }


  const data =
    await response.json();


  const parsed =
    SaveChatMessageResponseSchema.safeParse(
      data
    );


  if (!parsed.success) {
    console.error(
      "Invalid saved chat message response:",
      parsed.error
    );


    throw new Error(
      "Server returned invalid saved message data"
    );
  }


  return parsed.data.message;
}


export async function clearChatMessages(
  accessToken:
    string
): Promise<number> {
  const response =
    await fetch(
      `${API_BASE_URL}/chat/messages`,
      {
        method:
          "DELETE",

        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      }
    );


  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(
        response
      )
    );
  }


  const data =
    await response.json();


  const parsed =
    ClearChatMessagesResponseSchema.safeParse(
      data
    );


  if (!parsed.success) {
    console.error(
      "Invalid clear chat response:",
      parsed.error
    );


    throw new Error(
      "Server returned invalid clear chat data"
    );
  }

  return parsed.data.deletedCount;
}