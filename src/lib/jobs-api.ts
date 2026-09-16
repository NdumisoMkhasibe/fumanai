export type Job = {
  jobId: string;
  title: string;
  company: string;
  location: string;
  matchScore: number | null;
  column: string;
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

export async function getJobs(
  accessToken: string
): Promise<Job[]> {
  const response = await fetch(
    `${API_BASE_URL}/jobs`,
    {
      method: "GET",
      headers: authHeaders(accessToken),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load jobs: ${response.status}`
    );
  }

  return response.json();
}

export async function createJob(
  job: Omit<
    Job,
    "jobId" | "createdAt" | "updatedAt"
  >,
  accessToken: string
): Promise<Job> {
  const response = await fetch(
    `${API_BASE_URL}/jobs`,
    {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(job),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to create job: ${response.status}`
    );
  }

  return response.json();
}

export async function updateJob(
  jobId: string,
  changes: Partial<
    Omit<
      Job,
      "jobId" | "createdAt" | "updatedAt"
    >
  >,
  accessToken: string
): Promise<Job> {
  const response = await fetch(
    `${API_BASE_URL}/jobs/${jobId}`,
    {
      method: "PUT",
      headers: authHeaders(accessToken),
      body: JSON.stringify(changes),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to update job: ${response.status}`
    );
  }

  return response.json();
}

export async function deleteJob(
  jobId: string,
  accessToken: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/jobs/${jobId}`,
    {
      method: "DELETE",
      headers: authHeaders(accessToken),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to delete job: ${response.status}`
    );
  }
}