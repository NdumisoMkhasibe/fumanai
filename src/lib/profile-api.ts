export type Profile = {
  profileId: string;
  name: string;
  email: string;
  phone: string;
  targetRole: string;
  summary: string;
  education: string;
  skills: string;
  experience: string;
  extras: string;
  createdAt?: string;
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

export async function getProfiles(
  accessToken: string
): Promise<Profile[]> {
  const response = await fetch(`${API_BASE_URL}/profiles`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(`Failed to load profiles: ${response.status}`);
  }

  return response.json();
}

export async function getProfile(
  profileId: string,
  accessToken: string
): Promise<Profile> {
  const response = await fetch(
    `${API_BASE_URL}/profiles/${profileId}`,
    {
      method: "GET",
      headers: authHeaders(accessToken),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to load profile: ${response.status}`);
  }

  return response.json();
}

export async function createProfile(
  profile: Omit<Profile, "profileId" | "createdAt" | "updatedAt">,
  accessToken: string
): Promise<Profile> {
  const response = await fetch(`${API_BASE_URL}/profiles`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    throw new Error(`Failed to create profile: ${response.status}`);
  }

  return response.json();
}

export async function updateProfile(
  profileId: string,
  profile: Omit<Profile, "profileId" | "createdAt" | "updatedAt">,
  accessToken: string
): Promise<Profile> {
  const response = await fetch(
    `${API_BASE_URL}/profiles/${profileId}`,
    {
      method: "PUT",
      headers: authHeaders(accessToken),
      body: JSON.stringify(profile),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update profile: ${response.status}`);
  }

  return response.json();
}

export async function deleteProfile(
  profileId: string,
  accessToken: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/profiles/${profileId}`,
    {
      method: "DELETE",
      headers: authHeaders(accessToken),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete profile: ${response.status}`);
  }
}