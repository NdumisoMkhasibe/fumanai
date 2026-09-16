import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  TRACKER_COLUMNS,
  type TrackerColumn,
} from "@/lib/tracker";

import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  type Job,
} from "@/lib/jobs-api";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      {
        title: "Job Tracker — FumanAI",
      },
      {
        name: "description",
        content:
          "Track every application on a Kanban board — from Applied to Hired.",
      },
      {
        property: "og:title",
        content: "Job Tracker — FumanAI",
      },
      {
        property: "og:description",
        content:
          "Kanban board for every application.",
      },
    ],
  }),
  component: TrackerPage,
});

function TrackerPage() {
  const auth = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [dragId, setDragId] =
    useState<string | null>(null);

  const [overCol, setOverCol] =
    useState<TrackerColumn | null>(null);

  const accessToken =
    auth.user?.access_token;

  useEffect(() => {
    const loadJobs = async () => {
      if (!accessToken) {
        setJobs([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const loadedJobs =
          await getJobs(accessToken);

        setJobs(loadedJobs);
      } catch (error) {
        console.error(
          "Failed to load jobs:",
          error
        );

        toast.error(
          "Could not load job tracker"
        );
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [accessToken]);

  const handleAddJob = async (job: {
    title: string;
    company: string;
    location: string;
    matchScore: number;
  }) => {
    if (!accessToken) {
      toast.error("Please sign in first");
      return;
    }

    try {
      const created = await createJob(
        {
          title: job.title,
          company: job.company,
          location: job.location,
          matchScore: job.matchScore,
          column: "Applied",
        },
        accessToken
      );

      setJobs((current) => [
        ...current,
        created,
      ]);

      toast.success(
        "Application added"
      );
    } catch (error) {
      console.error(
        "Failed to create job:",
        error
      );

      toast.error(
        "Could not add application"
      );

      throw error;
    }
  };

  const handleMoveJob = async (
    jobId: string,
    column: TrackerColumn
  ) => {
    if (!accessToken) {
      toast.error("Please sign in first");
      return;
    }

    const currentJob = jobs.find(
      (job) => job.jobId === jobId
    );

    if (!currentJob) {
      return;
    }

    if (currentJob.column === column) {
      return;
    }

    try {
      const updated = await updateJob(
        jobId,
        {
          column,
        },
        accessToken
      );

      setJobs((current) =>
        current.map((job) => {
          if (job.jobId === updated.jobId) {
            return updated;
          }

          return job;
        })
      );
    } catch (error) {
      console.error(
        "Failed to move job:",
        error
      );

      toast.error(
        "Could not move application"
      );
    }
  };

  const handleDeleteJob = async (
    jobId: string
  ) => {
    if (!accessToken) {
      toast.error("Please sign in first");
      return;
    }

    try {
      await deleteJob(
        jobId,
        accessToken
      );

      setJobs((current) =>
        current.filter(
          (job) =>
            job.jobId !== jobId
        )
      );

      toast.success(
        "Application deleted"
      );
    } catch (error) {
      console.error(
        "Failed to delete job:",
        error
      );

      toast.error(
        "Could not delete application"
      );
    }
  };

  const onDrop = async (
    column: TrackerColumn
  ) => {
    if (dragId) {
      await handleMoveJob(
        dragId,
        column
      );
    }

    setDragId(null);
    setOverCol(null);
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-10 md:py-14">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Sign in to access your job tracker.
          </p>

          <Button
            className="mt-4"
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

  if (loading) {
    return <div className="p-12" />;
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10 md:py-14">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold md:text-4xl">
            Job Tracker
          </h1>

          <p className="mt-2 text-muted-foreground">
            Drag applications between stages.
            Applications you generate with
            FumanAI land in{" "}
            <span className="font-medium text-foreground">
              Applied
            </span>{" "}
            automatically.
          </p>
        </div>

        <AddCardDialog
          onAdd={handleAddJob}
        />
      </div>

      <div className="mt-8 grid grid-flow-col auto-cols-[minmax(260px,1fr)] gap-4 overflow-x-auto pb-4">
        {TRACKER_COLUMNS.map(
          (column) => {
            const columnJobs =
              jobs.filter(
                (job) =>
                  job.column === column
              );

            const isOver =
              overCol === column;

            return (
              <div
                key={column}
                className={`rounded-lg border bg-muted/30 p-3 transition-colors ${
                  isOver
                    ? "border-primary bg-primary/5"
                    : ""
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setOverCol(column);
                }}
                onDragLeave={() =>
                  setOverCol(
                    (current) =>
                      current === column
                        ? null
                        : current
                  )
                }
                onDrop={() =>
                  onDrop(column)
                }
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold">
                    {column}
                  </h2>

                  <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                    {columnJobs.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {columnJobs.map(
                    (job) => (
                      <Card
                        key={job.jobId}
                        draggable
                        onDragStart={() =>
                          setDragId(
                            job.jobId
                          )
                        }
                        onDragEnd={() => {
                          setDragId(null);
                          setOverCol(null);
                        }}
                        className={`cursor-grab p-3 active:cursor-grabbing ${
                          dragId ===
                          job.jobId
                            ? "opacity-50"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              {job.title}
                            </div>

                            <div className="truncate text-sm text-muted-foreground">
                              {
                                job.company
                              }
                            </div>

                            <div className="truncate text-xs text-muted-foreground">
                              {
                                job.location
                              }
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              handleDeleteJob(
                                job.jobId
                              )
                            }
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Delete card"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Match{" "}
                          {(
                            job.matchScore ??
                            0
                          ).toFixed(1)}{" "}
                          / 10
                        </div>
                      </Card>
                    )
                  )}

                  {columnJobs.length ===
                    0 && (
                    <div className="rounded border border-dashed p-4 text-center text-xs text-muted-foreground">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

function AddCardDialog({
  onAdd,
}: {
  onAdd: (job: {
    title: string;
    company: string;
    location: string;
    matchScore: number;
  }) => Promise<void>;
}) {
  const [open, setOpen] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [company, setCompany] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [score, setScore] =
    useState("7.0");

  const submit = async () => {
    try {
      setSaving(true);

      await onAdd({
        title,
        company,
        location,
        matchScore:
          Number(score) || 0,
      });

      setTitle("");
      setCompany("");
      setLocation("");
      setScore("7.0");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          Add application
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Add application
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">
              Job title
            </label>

            <Input
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="e.g. Senior Product Designer"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Company
            </label>

            <Input
              value={company}
              onChange={(event) =>
                setCompany(
                  event.target.value
                )
              }
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Location
            </label>

            <Input
              value={location}
              onChange={(event) =>
                setLocation(
                  event.target.value
                )
              }
              placeholder="e.g. Remote, London"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Match score (0–10)
            </label>

            <Input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={score}
              onChange={(event) =>
                setScore(
                  event.target.value
                )
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              setOpen(false)
            }
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            onClick={submit}
            disabled={
              saving ||
              !title.trim() ||
              !company.trim()
            }
          >
            {saving
              ? "Adding..."
              : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}