const API_BASE_URL =
  "https://rrg31ef4vj.execute-api.af-south-1.amazonaws.com";

type AIRequest<TInput> = {
  task: string;
  input: TInput;
};

export async function runAITask<
  TOutput,
  TInput
>(
  task: string,
  input: TInput,
  accessToken: string
): Promise<TOutput> {
  const request: AIRequest<TInput> = {
    task,
    input,
  };

  const response = await fetch(
    `${API_BASE_URL}/ai/generate`,
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(
        request
      ),
    }
  );

  if (!response.ok) {
    let message =
      `AI request failed: ${response.status}`;

    try {
      const errorBody =
        await response.json();

      if (errorBody?.message) {
        message =
          errorBody.message;
      }

      if (errorBody?.error) {
        message +=
          `: ${errorBody.error}`;
      }
    } catch {
      // Keep the HTTP status message.
    }

    throw new Error(message);
  }

  return response.json();
}