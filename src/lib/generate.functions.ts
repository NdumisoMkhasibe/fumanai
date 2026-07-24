import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";

const ProfileSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  targetRole: z.string(),
  summary: z.string(),
  education: z.string(),
  skills: z.string(),
  experience: z.string(),
  extras: z.string(),
});

const Input = z.object({
  profile: ProfileSchema,
  jobAdvertisement: z.string().min(20),
});

const ResultSchema = z.object({
  cv: z.object({
    header: z.object({
      name: z.string(),
      email: z.string(),
      phone: z.string(),
    }),
    professionalSummary: z.string(),
    education: z.array(z.string()),
    coreSkills: z.array(z.string()),
    workExperience: z.array(
      z.object({
        role: z.string(),
        organization: z.string(),
        period: z.string(),
        bullets: z.array(z.string()),
      }),
    ),
    additionalInformation: z.array(z.string()),
  }),
  coverLetter: z.string(),
  email: z.object({
    to: z.string(),
    subject: z.string(),
    body: z.string(),
  }),
  job: z.object({
    title: z.string(),
    company: z.string(),
    location: z.string(),
    matchScore: z.number(),
  }),
});

export type GeneratedApplication = z.infer<typeof ResultSchema>;

export const generateApplication = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => Input.parse(v))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-2.5-flash");

    const system = `You are FumanAI, an assistant that produces ATS-friendly job application materials.
RULES:
- Never fabricate qualifications, employers, dates, or skills.
- Never highlight missing skills; instead, emphasize transferable strengths from the candidate profile.
- Use plain, professional language, active voice, quantified impact when the candidate provided data.
- Match keywords from the job advertisement only when supported by the candidate's actual profile.
- Keep the cover letter under 350 words. Keep the application email under 180 words.
- Also extract the job's title, company, and location from the advertisement (use "Unknown" if missing) and score the candidate/job fit as a number from 0 to 10 with one decimal place (e.g. 7.4).`;

    const prompt = `CANDIDATE PROFILE (source of truth):
Name: ${data.profile.name}
Email: ${data.profile.email}
Phone: ${data.profile.phone}
Target role: ${data.profile.targetRole}
Professional summary: ${data.profile.summary}
Education: ${data.profile.education}
Skills: ${data.profile.skills}
Work experience: ${data.profile.experience}
Additional information: ${data.profile.extras}

JOB ADVERTISEMENT:
${data.jobAdvertisement}

Task: Produce a tailored ATS-friendly CV, a cover letter, and an application email. Extract the recipient email from the job ad if present, otherwise use "hiring@company.example". For the email subject use "Application: <Role> — <Candidate Name>". Also fill in job.title, job.company, job.location, and job.matchScore (0-10, one decimal).`;

    try {
      const { output } = await generateText({
        model,
        system,
        prompt,
        output: Output.object({ schema: ResultSchema }),
      });
      return output;
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err) && err.text) {
        const parsed = tryExtractJson(err.text);
        if (parsed) {
          const check = ResultSchema.safeParse(parsed);
          if (check.success) return check.data;
        }
      }
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Generation failed: ${message}`);
    }
  });

function tryExtractJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const first = trimmed.indexOf("{");
    const last = trimmed.lastIndexOf("}");
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(trimmed.slice(first, last + 1));
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
}