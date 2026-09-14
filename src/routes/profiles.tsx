import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";

import {
  createProfile,
  deleteProfile,
  getProfiles,
  updateProfile,
  type Profile,
} from "@/lib/profile-api";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Star, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  getPreferences,
  updatePreferences,
} from "@/lib/preferences-api";

export const Route = createFileRoute("/profiles")({
  head: () => ({
    meta: [
      { title: "Profiles — FumanAI" },
      {
        name: "description",
        content:
          "Manage the career profiles FumanAI uses to tailor your applications. One profile per career path.",
      },
      { property: "og:title", content: "Profiles — FumanAI" },
      {
        property: "og:description",
        content: "Manage career profiles for tailored applications.",
      },
    ],
  }),
  component: ProfilesPage,
});

type ProfileFormData = Omit<
  Profile,
  "profileId" | "createdAt" | "updatedAt"
>;

const FIELDS: Array<{
  key: keyof ProfileFormData;
  label: string;
  type: "input" | "textarea";
}> = [
  { key: "name", label: "Full name", type: "input" },
  { key: "email", label: "Email", type: "input" },
  { key: "phone", label: "Phone", type: "input" },
  {
    key: "targetRole",
    label: "Target role / career path",
    type: "input",
  },
  {
    key: "summary",
    label: "Professional summary",
    type: "textarea",
  },
  { key: "education", label: "Education", type: "textarea" },
  { key: "skills", label: "Core skills", type: "textarea" },
  {
    key: "experience",
    label: "Work experience",
    type: "textarea",
  },
  {
    key: "extras",
    label: "Additional information",
    type: "textarea",
  },
];

function emptyForm(): ProfileFormData {
  return {
    name: "",
    email: "",
    phone: "",
    targetRole: "",
    summary: "",
    education: "",
    skills: "",
    experience: "",
    extras: "",
  };
}

function ProfileForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Profile;
  onSubmit: (form: ProfileFormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<ProfileFormData>(() => {
    if (!initial) {
      return emptyForm();
    }

    return {
      name: initial.name,
      email: initial.email,
      phone: initial.phone,
      targetRole: initial.targetRole,
      summary: initial.summary,
      education: initial.education,
      skills: initial.skills,
      experience: initial.experience,
      extras: initial.extras,
    };
  });

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name required");
      return;
    }

    try {
      setSaving(true);
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-2">
      {FIELDS.map((field) => (
        <div key={field.key}>
          <Label htmlFor={field.key}>{field.label}</Label>

          {field.type === "input" ? (
            <Input
              id={field.key}
              className="mt-1"
              value={form[field.key]}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }))
              }
            />
          ) : (
            <Textarea
              id={field.key}
              className="mt-1"
              rows={3}
              value={form[field.key]}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }))
              }
            />
          )}
        </div>
      ))}

      <DialogFooter>
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save profile"}
        </Button>
      </DialogFooter>
    </div>
  );
}

function ProfilesPage() {
  const auth = useAuth();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);

  const accessToken = auth.user?.access_token;


  const loadProfiles = async () => {
    if (!accessToken) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const loadedProfiles = await getProfiles(accessToken);


      setProfiles(loadedProfiles);
    } catch (error) {
      console.error("Failed to load profiles:", error);
      toast.error("Could not load profiles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (!accessToken) {
    return;
  }

  const loadPreferences = async () => {
    try {
      const preferences =
        await getPreferences(accessToken);

      setActiveId(
        preferences.activeProfileId
      );
    } catch (error) {
      console.error(
        "Failed to load preferences:",
        error
      );

      toast.error(
        "Could not load profile preferences"
      );
    }
  };

  loadPreferences();
}, [accessToken]);

  const handleSetActive = async (
  profileId: string
) => {
  if (!accessToken) {
    toast.error("Please sign in first");
    return;
  }

  try {
    await updatePreferences(
      profileId,
      accessToken
    );

    setActiveId(profileId);

    toast.success(
      "Active profile switched"
    );
  } catch (error) {
    console.error(
      "Failed to update active profile:",
      error
    );

    toast.error(
      "Could not switch active profile"
    );
  }
};

  const handleCreate = async (form: ProfileFormData) => {
    if (!accessToken) {
      toast.error("Please sign in first");
      return;
    }

    try {
      const created = await createProfile(
        form,
        accessToken
      );

      setProfiles((current) => [
        ...current,
        created,
      ]);

      if (!activeId) {
        await handleSetActive(
          created.profileId
        );
      }

      toast.success("Saved");
      setCreating(false);
    } catch (error) {
      console.error("Failed to create profile:", error);
      toast.error("Could not save profile");
    }
  };

  const handleUpdate = async (
    profile: Profile,
    form: ProfileFormData
  ) => {
    if (!accessToken) {
      toast.error("Please sign in first");
      return;
    }

    try {
      const updated = await updateProfile(
        profile.profileId,
        form,
        accessToken
      );

      setProfiles((current) =>
        current.map((item) => {
          if (item.profileId === updated.profileId) {
            return updated;
          }

          return item;
        })
      );

      toast.success("Saved");
      setEditing(null);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Could not update profile");
    }
  };

  const handleDelete = async (profile: Profile) => {
    if (!accessToken) {
      toast.error("Please sign in first");
      return;
    }

    const confirmed = confirm(
      `Delete profile "${profile.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProfile(
        profile.profileId,
        accessToken
      );

      setProfiles((current) =>
        current.filter(
          (item) =>
            item.profileId !== profile.profileId
        )
      );

      if (activeId === profile.profileId) {
        await updatePreferences(
          null,
          accessToken
        );

        setActiveId(null);
      }

      toast.success("Deleted");
    } catch (error) {
      console.error("Failed to delete profile:", error);
      toast.error("Could not delete profile");
    }
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Sign in to access your FumanAI profiles.
          </p>

          <Button
            className="mt-4"
            onClick={() => auth.signinRedirect()}
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
    <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold md:text-4xl">
            Profiles
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            One profile = one career path.
            Your profiles are securely synced across your devices.
          </p>
        </div>

        <Dialog
          open={creating}
          onOpenChange={setCreating}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New profile
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create profile</DialogTitle>
            </DialogHeader>

            <ProfileForm
              onSubmit={handleCreate}
              onCancel={() => setCreating(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 grid gap-3">
        {profiles.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            No profiles yet. Create one to get started.
          </Card>
        )}

        {profiles.map((profile) => (
          <Card
            key={profile.profileId}
            className="flex flex-wrap items-center justify-between gap-3 p-5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="font-[Poppins] text-lg font-semibold">
                  {profile.name || "(unnamed)"}
                </div>

                {profile.profileId === activeId && (
                  <Badge className="bg-accent text-accent-foreground hover:bg-accent">
                    Active
                  </Badge>
                )}
              </div>

              <div className="truncate text-sm text-muted-foreground">
                {profile.targetRole ||
                  "No target role set"}
              </div>
            </div>

            <div className="flex gap-2">
              {profile.profileId !== activeId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleSetActive(
                      profile.profileId
                    )
                  }
                >
                  <Star className="mr-1 h-3.5 w-3.5" />
                  Set active
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(profile)}
              >
                <Pencil className="mr-1 h-3.5 w-3.5" />
                Edit
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  handleDelete(profile)
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>

          {editing && (
            <ProfileForm
              initial={editing}
              onSubmit={(form) =>
                handleUpdate(editing, form)
              }
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}