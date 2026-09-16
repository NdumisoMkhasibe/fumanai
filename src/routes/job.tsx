import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { generateApplication, type GeneratedApplication } from "@/lib/generate.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

import {
  getProfiles,
  type Profile,
} from "@/lib/profile-api";

import {
  getPreferences,
} from "@/lib/preferences-api";

import {
  createJob,
} from "@/lib/jobs-api"; 

export const Route = createFileRoute("/job")({
  head: () => ({
    meta: [
      { title: "Generate Application — FumanAI" },
      { name: "description", content: "Paste a job advertisement and generate an ATS-friendly CV, cover letter, and application email tailored to it." },
      { property: "og:title", content: "Generate Application — FumanAI" },
      { property: "og:description", content: "Paste a job ad. Get a tailored CV, cover letter, and email." },
    ],
  }),
  component: JobPage,
});

function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 1500);
      }}
    >
      {ok ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
      {ok ? "Copied" : label}
    </Button>
  );
}

function renderCvText(cv: GeneratedApplication["cv"]): string {
  const lines: string[] = [];
  lines.push(cv.header.name);
  lines.push(`${cv.header.email} · ${cv.header.phone}`);
  lines.push("");
  lines.push("PROFESSIONAL SUMMARY");
  lines.push(cv.professionalSummary);
  lines.push("");
  lines.push("EDUCATION");
  cv.education.forEach((e) => lines.push(`• ${e}`));
  lines.push("");
  lines.push("CORE SKILLS");
  lines.push(cv.coreSkills.join(" · "));
  lines.push("");
  lines.push("WORK EXPERIENCE");
  cv.workExperience.forEach((w) => {
    lines.push(`${w.role} — ${w.organization} (${w.period})`);
    w.bullets.forEach((b) => lines.push(`  • ${b}`));
    lines.push("");
  });
  if (cv.additionalInformation.length) {
    lines.push("ADDITIONAL INFORMATION");
    cv.additionalInformation.forEach((a) => lines.push(`• ${a}`));
  }
  return lines.join("\n");
}

function download(name: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function JobPage() {
  const auth = useAuth();

  const [profiles, setProfiles] =
    useState<Profile[]>([]);

  const [activeId, setActiveId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [ad, setAd] =
    useState("");

  const accessToken =
    auth.user?.access_token;

  const generate =
    useServerFn(generateApplication);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!accessToken) {
        setProfiles([]);
        setActiveId(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [
          loadedProfiles,
          preferences,
        ] = await Promise.all([
          getProfiles(accessToken),
          getPreferences(accessToken),
        ]);

        setProfiles(loadedProfiles);

        setActiveId(
          preferences.activeProfileId
        );
      } catch (error) {
        console.error(
          "Failed to load profile data:",
          error
        );

        toast.error(
          "Could not load your profile"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [accessToken]);

  const active =
    profiles.find(
      (profile) =>
        profile.profileId === activeId
    ) ?? profiles[0];

  const mutation = useMutation({
    mutationFn: async (payload: {
      profile: Profile;
      jobAdvertisement: string;
    }) => {
      const profileForGeneration = {
        name: payload.profile.name,
        email: payload.profile.email,
        phone: payload.profile.phone,
        targetRole:
          payload.profile.targetRole,
        summary:
          payload.profile.summary,
        education:
          payload.profile.education,
        skills:
          payload.profile.skills,
        experience:
          payload.profile.experience,
        extras:
          payload.profile.extras,
      };

      return await generate({
        data: {
          profile:
            profileForGeneration,
          jobAdvertisement:
            payload.jobAdvertisement,
        },
      });
    },

    onSuccess: async (data) => {
      if (!data?.job) {
        return;
      }

      if (!accessToken) {
        toast.error(
          "Application generated, but you need to sign in to save it to the Job Tracker"
        );
        return;
      }

      try {
        await createJob(
          {
            title:
              data.job.title,
            company:
              data.job.company,
            location:
              data.job.location,
            matchScore:
              data.job.matchScore,
            column: "Applied",
          },
          accessToken
        );

        toast.success(
          "Added to Job Tracker"
        );
      } catch (error) {
        console.error(
          "Failed to add generated application to Job Tracker:",
          error
        );

        toast.error(
          "Application generated, but could not add it to the Job Tracker"
        );
      }
    },

    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    },
  });

  if (auth.isLoading || loading) {
    return (
      <div className="p-12" />
    );
  }

  if (
    !auth.isAuthenticated ||
    !accessToken
  ) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <Card className="p-8">
          <h1 className="text-2xl font-semibold">
            Sign in to generate an application
          </h1>

          <p className="mt-2 text-muted-foreground">
            FumanAI uses your saved
            profile to tailor your
            application.
          </p>

          <Button
            className="mt-6"
            onClick={() =>
              auth.signinRedirect()
            }
          >
            Sign in
          </Button>
        </Card>
      </div>
    );
  }

  if (
    profiles.length === 0 ||
    !active
  ) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">
          Create a profile first
        </h1>

        <p className="mt-2 text-muted-foreground">
          FumanAI needs your details
          to tailor the application.
        </p>

        <Link
          to="/profiles"
          className="mt-6 inline-block underline"
        >
          Open Profiles
        </Link>
      </div>
    );
  }

  const result = mutation.data;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
      <h1 className="text-3xl font-semibold md:text-4xl">
        Generate application
      </h1>

      <p className="mt-2 text-muted-foreground">
        Using profile:{" "}
        <span className="font-medium text-foreground">
          {active.name}
        </span>{" "}
        — {active.targetRole}
      </p>

      <Card className="mt-6 p-6">
        <label className="text-sm font-medium">
          Paste the job advertisement
        </label>

        <Textarea
          rows={10}
          className="mt-2"
          placeholder="Paste the full job description here — role, responsibilities, requirements, company info, contact email if listed…"
          value={ad}
          onChange={(event) =>
            setAd(
              event.target.value
            )
          }
        />

        <div className="mt-4 flex justify-end">
          <Button
            disabled={
              ad.trim().length < 20 ||
              mutation.isPending
            }
            onClick={() =>
              mutation.mutate({
                profile: active,
                jobAdvertisement: ad,
              })
            }
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              "Generate application"
            )}
          </Button>
        </div>
      </Card>

      {result && (
        <div className="mt-8 animate-in fade-in duration-500">
          <Tabs defaultValue="cv">
            <TabsList>
              <TabsTrigger value="cv">
                CV
              </TabsTrigger>

              <TabsTrigger value="cover">
                Cover Letter
              </TabsTrigger>

              <TabsTrigger value="email">
                Application Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cv">
              <Card className="p-6">
                <div className="mb-4 flex justify-end gap-2">
                  <CopyBtn
                    text={renderCvText(
                      result.cv
                    )}
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      download(
                        `${active.name}-CV.txt`,
                        renderCvText(
                          result.cv
                        )
                      )
                    }
                  >
                    Download .txt
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      download(
                        `${active.name}-CV.doc`,
                        renderCvText(
                          result.cv
                        ),
                        "application/msword"
                      )
                    }
                  >
                    Download .doc
                  </Button>
                </div>

                <div className="border-b pb-4">
                  <div className="text-2xl font-semibold">
                    {
                      result.cv.header
                        .name
                    }
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {
                      result.cv.header
                        .email
                    }{" "}
                    ·{" "}
                    {
                      result.cv.header
                        .phone
                    }
                  </div>
                </div>

                <section className="mt-4">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                    Professional summary
                  </h3>

                  <p className="mt-1">
                    {
                      result.cv
                        .professionalSummary
                    }
                  </p>
                </section>

                <section className="mt-4">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                    Education
                  </h3>

                  <ul className="mt-1 list-disc pl-5">
                    {result.cv.education.map(
                      (education, index) => (
                        <li key={index}>
                          {education}
                        </li>
                      )
                    )}
                  </ul>
                </section>

                <section className="mt-4">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                    Core skills
                  </h3>

                  <p className="mt-1">
                    {result.cv.coreSkills.join(
                      " · "
                    )}
                  </p>
                </section>

                <section className="mt-4">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                    Work experience
                  </h3>

                  <div className="mt-1 space-y-4">
                    {result.cv.workExperience.map(
                      (
                        work,
                        index
                      ) => (
                        <div
                          key={index}
                        >
                          <div className="font-medium">
                            {
                              work.role
                            }{" "}
                            —{" "}
                            {
                              work.organization
                            }
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {
                              work.period
                            }
                          </div>

                          <ul className="mt-1 list-disc pl-5">
                            {work.bullets.map(
                              (
                                bullet,
                                bulletIndex
                              ) => (
                                <li
                                  key={
                                    bulletIndex
                                  }
                                >
                                  {
                                    bullet
                                  }
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )
                    )}
                  </div>
                </section>

                {result.cv
                  .additionalInformation
                  .length > 0 && (
                  <section className="mt-4">
                    <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                      Additional
                      information
                    </h3>

                    <ul className="mt-1 list-disc pl-5">
                      {result.cv.additionalInformation.map(
                        (
                          information,
                          index
                        ) => (
                          <li
                            key={
                              index
                            }
                          >
                            {
                              information
                            }
                          </li>
                        )
                      )}
                    </ul>
                  </section>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="cover">
              <Card className="p-6">
                <div className="mb-4 flex justify-end gap-2">
                  <CopyBtn
                    text={
                      result.coverLetter
                    }
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      download(
                        `${active.name}-CoverLetter.txt`,
                        result.coverLetter
                      )
                    }
                  >
                    Download .txt
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      download(
                        `${active.name}-CoverLetter.doc`,
                        result.coverLetter,
                        "application/msword"
                      )
                    }
                  >
                    Download .doc
                  </Button>
                </div>

                <div className="whitespace-pre-wrap font-[Inter] leading-relaxed">
                  {
                    result.coverLetter
                  }
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="email">
              <Card className="space-y-4 p-6">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground">
                      To
                    </label>

                    <CopyBtn
                      text={
                        result.email.to
                      }
                    />
                  </div>

                  <div className="mt-1 rounded border bg-muted/30 px-3 py-2 text-sm">
                    {result.email.to}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Subject
                    </label>

                    <CopyBtn
                      text={
                        result.email
                          .subject
                      }
                    />
                  </div>

                  <div className="mt-1 rounded border bg-muted/30 px-3 py-2 text-sm">
                    {
                      result.email
                        .subject
                    }
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Body
                    </label>

                    <CopyBtn
                      text={
                        result.email.body
                      }
                    />
                  </div>

                  <div className="mt-1 whitespace-pre-wrap rounded border bg-muted/30 px-3 py-3 text-sm leading-relaxed">
                    {
                      result.email.body
                    }
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
  
}