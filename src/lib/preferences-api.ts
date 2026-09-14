export type Preferences = {
  activeProfileId: string | null;
  updatedAt?: string;
};

const API_BASE_URL =
  "https://rrg31ef4vj.execute-api.af-south-1.amazonaws.com";

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

export async function getPreferences(
  accessToken: string
): Promise<Preferences> {
  const response = await fetch(
    `${API_BASE_URL}/preferences`,
    {
      method: "GET",
      headers: authHeaders(accessToken),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load preferences: ${response.status}`
    );
  }

  return response.json();
}

export async function updatePreferences(
  activeProfileId: string | null,
  accessToken: string
): Promise<Preferences> {
  const response = await fetch(
    `${API_BASE_URL}/preferences`,
    {
      method: "PUT",
      headers: authHeaders(accessToken),
      body: JSON.stringify({
        activeProfileId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to update preferences: ${response.status}`
    );
  }

  return response.json();
}