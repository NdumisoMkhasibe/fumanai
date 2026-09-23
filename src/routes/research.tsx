import {
  createFileRoute,
} from "@tanstack/react-router";

import {
  useState,
} from "react";

import {
  useAuth,
} from "react-oidc-context";

import {
  useMutation,
} from "@tanstack/react-query";

import {
  runResearch,
} from "@/lib/research-api";

import {
  Card,
} from "@/components/ui/card";

import {
  Button,
} from "@/components/ui/button";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  Loader2,
} from "lucide-react";

import {
  toast,
} from "sonner";


export const Route =
  createFileRoute("/research")({
    head: () => ({
      meta: [
        {
          title:
            "AI Research Assistant — FumanAI",
        },
        {
          name:
            "description",
          content:
            "Summarize articles, generate insights, and get recommendations.",
        },
        {
          property:
            "og:title",
          content:
            "AI Research Assistant — FumanAI",
        },
        {
          property:
            "og:description",
          content:
            "Summaries, insights, recommendations.",
        },
      ],
    }),

    component:
      ResearchPage,
  });


function ResearchPage() {
  const auth =
    useAuth();


  const [
    topic,
    setTopic,
  ] =
    useState("");


  const accessToken =
    auth.user
      ?.access_token;


  const mutation =
    useMutation({
      mutationFn:
        async () => {
          if (!accessToken) {
            throw new Error(
              "You must be signed in"
            );
          }


          return await runResearch(
            {
              topic,
            },
            accessToken
          );
        },


      onError:
        (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to research."
          );
        },
    });


  const result =
    mutation.data;


  if (
    auth.isLoading
  ) {
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
            Sign in to use Research Assistant
          </h1>

          <p className="mt-2 text-muted-foreground">
            Sign in to use FumanAI's AI Research Assistant.
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


  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
      <h1 className="text-3xl font-semibold md:text-4xl">
        AI Research Assistant
      </h1>

      <p className="mt-2 text-muted-foreground">
        Paste an article or type a topic. Get a summary,
        key insights, recommendations, and follow-ups.
      </p>


      <Card className="mt-6 p-6">
        <label className="text-sm font-medium">
          Topic or article
        </label>

        <Textarea
          rows={10}
          className="mt-1"
          placeholder="e.g. 'AI hiring trends' or paste article text…"
          value={topic}
          onChange={(event) =>
            setTopic(
              event.target.value
            )
          }
        />

        <div className="mt-4 flex justify-end">
          <Button
            disabled={
              topic
                .trim()
                .length < 3 ||
              mutation.isPending
            }
            onClick={() =>
              mutation.mutate()
            }
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Researching…
              </>
            ) : (
              "Research"
            )}
          </Button>
        </div>
      </Card>


      {result && (
        <div className="mt-6 space-y-4 animate-in fade-in duration-500">
          <Card className="p-6">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
              Summary
            </h3>

            <p className="mt-2 leading-relaxed">
              {
                result.summary
              }
            </p>
          </Card>


          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                Key insights
              </h3>

              {result.keyInsights.length ===
              0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  None identified.
                </p>
              ) : (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {result.keyInsights.map(
                    (
                      insight,
                      index
                    ) => (
                      <li
                        key={
                          index
                        }
                      >
                        {
                          insight
                        }
                      </li>
                    )
                  )}
                </ul>
              )}
            </Card>


            <Card className="p-6">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                Recommendations
              </h3>

              {result.recommendations.length ===
              0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  None identified.
                </p>
              ) : (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {result.recommendations.map(
                    (
                      recommendation,
                      index
                    ) => (
                      <li
                        key={
                          index
                        }
                      >
                        {
                          recommendation
                        }
                      </li>
                    )
                  )}
                </ul>
              )}
            </Card>
          </div>


          <Card className="p-6">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
              Follow-up questions
            </h3>

            {result.followUpQuestions.length ===
            0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                None identified.
              </p>
            ) : (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {result.followUpQuestions.map(
                  (
                    question,
                    index
                  ) => (
                    <li
                      key={
                        index
                      }
                    >
                      {
                        question
                      }
                    </li>
                  )
                )}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}