export type Profile = {
  userId?: string;
  profileId: string;
  name: string;
  email: string;
  phone: string;
  targetRole: string;
  summary: string;
  education: unknown[];
  skills: string[];
  experience: unknown[];
  extras: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

const API_BASE_URL =
  "https://rrg31ef4vj.execute-api.af-south-1.amazonaws.com";

export async function getProfile(
  profileId: string,
  accessToken: string
): Promise<Profile | null> {
  const response = await fetch(
    `${API_BASE_URL}/profiles/${profileId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to load profile: ${response.status}`);
  }

  return response.json();
}

export async function createProfile(
  profile: Profile,
  accessToken: string
): Promise<Profile> {
  const response = await fetch(
    `${API_BASE_URL}/profiles`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to save profile: ${response.status}`);
  }

  return response.json();
}