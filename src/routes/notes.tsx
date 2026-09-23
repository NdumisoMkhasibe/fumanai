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
  summarizeNotes,
} from "@/lib/notes-api";

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
  createFileRoute("/notes")({
    head: () => ({
      meta: [
        {
          title:
            "Meeting Notes Summarizer — FumanAI",
        },
        {
          name:
            "description",
          content:
            "Summarize meetings and extract action items, decisions, and deadlines.",
        },
        {
          property:
            "og:title",
          content:
            "Meeting Notes Summarizer — FumanAI",
        },
        {
          property:
            "og:description",
          content:
            "Summaries, action items, decisions, deadlines.",
        },
      ],
    }),

    component:
      NotesPage,
  });


function NotesPage() {
  const auth =
    useAuth();


  const [
    notes,
    setNotes,
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


          return await summarizeNotes(
            {
              notes,
            },
            accessToken
          );
        },


      onError:
        (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to summarize."
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
            Sign in to summarize meeting notes
          </h1>

          <p className="mt-2 text-muted-foreground">
            Sign in to use FumanAI's Meeting Notes Summarizer.
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
        Meeting Notes Summarizer
      </h1>

      <p className="mt-2 text-muted-foreground">
        Paste raw notes or a transcript. Get a clean summary plus action items, decisions, and deadlines.
      </p>


      <Card className="mt-6 p-6">
        <label className="text-sm font-medium">
          Raw notes
        </label>

        <Textarea
          rows={12}
          className="mt-1"
          placeholder="Paste meeting notes or a transcript…"
          value={notes}
          onChange={(event) =>
            setNotes(
              event.target.value
            )
          }
        />

        <div className="mt-4 flex justify-end">
          <Button
            disabled={
              notes
                .trim()
                .length < 20 ||
              mutation.isPending
            }
            onClick={() =>
              mutation.mutate()
            }
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Summarizing…
              </>
            ) : (
              "Summarize"
            )}
          </Button>
        </div>
      </Card>


      {result && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 animate-in fade-in duration-500">
          <Card className="p-6 md:col-span-2">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
              Summary
            </h3>

            <p className="mt-2 leading-relaxed">
              {result.summary}
            </p>
          </Card>


          <Card className="p-6 md:col-span-2">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
              Action items
            </h3>

            {result.actionItems.length ===
            0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                None identified.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {result.actionItems.map(
                  (
                    action,
                    index
                  ) => (
                    <li
                      key={index}
                      className="rounded border bg-muted/30 px-3 py-2 text-sm"
                    >
                      <div className="font-medium">
                        {
                          action.task
                        }
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Owner:{" "}
                        {
                          action.owner
                        }{" "}
                        · Due:{" "}
                        {
                          action.due
                        }
                      </div>
                    </li>
                  )
                )}
              </ul>
            )}
          </Card>


          <Card className="p-6">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
              Decisions
            </h3>

            {result.decisions.length ===
            0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                None identified.
              </p>
            ) : (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {result.decisions.map(
                  (
                    decision,
                    index
                  ) => (
                    <li
                      key={index}
                    >
                      {
                        decision
                      }
                    </li>
                  )
                )}
              </ul>
            )}
          </Card>


          <Card className="p-6">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
              Deadlines
            </h3>

            {result.deadlines.length ===
            0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                None identified.
              </p>
            ) : (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {result.deadlines.map(
                  (
                    deadline,
                    index
                  ) => (
                    <li
                      key={index}
                    >
                      {
                        deadline
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