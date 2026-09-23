import { z } from "zod";

import { runAITask } from "@/lib/ai-api";

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

const GenerateApplicationInputSchema = z.object({
  profile: ProfileSchema,
  jobAdvertisement: z.string().min(20),
});

const GeneratedApplicationSchema = z.object({
  cv: z.object({
    header: z.object({
      name: z.string(),
      email: z.string(),
      phone: z.string(),
    }),

    professionalSummary: z.string(),

    education: z.array(
      z.string()
    ),

    coreSkills: z.array(
      z.string()
    ),

    workExperience: z.array(
      z.object({
        role: z.string(),
        organization: z.string(),
        period: z.string(),
        bullets: z.array(
          z.string()
        ),
      })
    ),

    additionalInformation:
      z.array(
        z.string()
      ),
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

export type GenerateApplicationInput =
  z.infer<
    typeof GenerateApplicationInputSchema
  >;

export type GeneratedApplication =
  z.infer<
    typeof GeneratedApplicationSchema
  >;

export async function generateApplication(
  input: GenerateApplicationInput,
  accessToken: string
): Promise<GeneratedApplication> {
  const validatedInput =
    GenerateApplicationInputSchema.parse(
      input
    );

  const response =
    await runAITask<
      unknown,
      GenerateApplicationInput
    >(
      "generate-application",
      validatedInput,
      accessToken
    );

  const parsed =
    GeneratedApplicationSchema.safeParse(
      response
    );

  if (!parsed.success) {
    console.error(
      "Invalid Generate Application response:",
      parsed.error
    );

    throw new Error(
      "AI returned invalid application data"
    );
  }

  return parsed.data;
}