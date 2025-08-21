"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  createLink,
  deleteLink,
  getLinks,
  getProfiles,
  updateLink,
  updateProfile,
} from "@/lib/api";
import type {
  LinkCreateInput,
  LinkUpdateInput,
  ProfileUpdateInput,
} from "@/lib/validation/link-in-bio";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  GripVertical,
  Edit2,
  Trash2,
  Plus,
  Instagram,
  Music,
  Youtube,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  Send,
  MessageCircle,
  Calendar,
  Lock,
  ImageIcon,
} from "lucide-react";
import { IconIcons } from "@tabler/icons-react";
import * as Tabler from "@tabler/icons-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// --- Inline Profile Section (editable displayName, bio, avatar) + social bar ---
function ProfileSection({
  profile,
  onUpdate,
  onAddSocial,
  onDeleteSocial,
}: {
  profile: any;
  onUpdate: (updates: Partial<any>) => void;
  onAddSocial: (platform: string, value: string) => void;
  onDeleteSocial: (platform: string) => void;
}) {
  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [urlValue, setUrlValue] = useState("");
  const [urlError, setUrlError] = useState<string>("");

  const socials = Object.entries(profile?.socialLinks || {}) as Array<
    [string, string]
  >;

  const SocialIcon = ({ name }: { name: string }) => {
    const map: Record<string, any> = {
      instagram: Instagram,
      tiktok: Music,
      youtube: Youtube,
      email: Mail,
      facebook: Facebook,
      twitter: Twitter,
      linkedin: Linkedin,
      github: Github,
      telegram: Send,
      whatsapp: MessageCircle,
    };
    const Icon = map[name];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  const platformList = [
    { id: "instagram", label: "Instagram" },
    { id: "tiktok", label: "TikTok" },
    { id: "youtube", label: "YouTube" },
    { id: "email", label: "Email" },
    { id: "facebook", label: "Facebook" },
    { id: "twitter", label: "Twitter" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "github", label: "GitHub" },
    { id: "telegram", label: "Telegram" },
    { id: "whatsapp", label: "WhatsApp" },
  ];
  const filteredPlatforms = platformList.filter((p) =>
    p.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage
              src={profile?.avatar || "/placeholder.svg"}
              alt={profile?.displayName || profile?.username}
            />
            <AvatarFallback>
              {(profile?.displayName || profile?.username || "")
                .charAt(0)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            {editingName ? (
              <Input
                defaultValue={profile?.displayName || ""}
                onBlur={(e) => {
                  onUpdate({ displayName: e.target.value });
                  setEditingName(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value;
                    onUpdate({ displayName: val });
                    setEditingName(false);
                  }
                }}
                className="text-xl font-semibold"
                autoFocus
              />
            ) : (
              <h1
                className="text-xl font-semibold cursor-pointer hover:text-primary"
                onClick={() => setEditingName(true)}
              >
                {profile?.displayName || profile?.username}
              </h1>
            )}
            {editingBio ? (
              <Input
                defaultValue={profile?.bio || ""}
                onBlur={(e) => {
                  onUpdate({ bio: e.target.value });
                  setEditingBio(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value;
                    onUpdate({ bio: val });
                    setEditingBio(false);
                  }
                }}
                className="text-muted-foreground"
                autoFocus
              />
            ) : (
              <p
                className="text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => setEditingBio(true)}
              >
                {profile?.bio || "Add a short bio"}
              </p>
            )}
            {/* Show only existing social links here */}
            <div className="flex items-center gap-2">
              {socials.map(([key]) => (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  className="p-2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSelectedPlatform(key);
                    const existing = profile?.socialLinks?.[key] || "";
                    setUrlValue(existing);
                    setUrlError("");
                    setSocialOpen(true);
                  }}
                >
                  <SocialIcon name={key} />
                </Button>
              ))}
              <Dialog open={socialOpen} onOpenChange={setSocialOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add social</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {!selectedPlatform ? (
                      <div className="space-y-3">
                        <div>
                          <Input
                            placeholder="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-1">
                          {filteredPlatforms.map((p) => {
                            const exists = !!(
                              profile?.socialLinks && profile.socialLinks[p.id]
                            );
                            return (
                              <Button
                                key={p.id}
                                variant="ghost"
                                className="w-full justify-between h-10"
                                onClick={() => setSelectedPlatform(p.id)}
                              >
                                <span>{p.label}</span>
                                {exists ? (
                                  <span>✓</span>
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-sm">
                          {
                            platformList.find((x) => x.id === selectedPlatform)
                              ?.label
                          }
                        </div>
                        <div className="space-y-1">
                          <Input
                            placeholder="https://social.url"
                            value={urlValue}
                            onChange={(e) => {
                              setUrlValue(e.target.value);
                              setUrlError("");
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const v = urlValue.trim();
                                if (!/^https?:\/\//i.test(v)) {
                                  setUrlError(
                                    "URL must start with http:// or https://"
                                  );
                                  return;
                                }
                                onAddSocial(selectedPlatform, v);
                                setSelectedPlatform("");
                                setUrlValue("");
                                setUrlError("");
                                setSocialOpen(false);
                              }
                            }}
                            autoFocus
                          />
                          {urlError && (
                            <p className="text-xs text-destructive">
                              {urlError}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedPlatform("");
                              setUrlValue("");
                              setUrlError("");
                            }}
                            className="bg-transparent"
                          >
                            Back
                          </Button>
                          <Button
                            onClick={() => {
                              const v = urlValue.trim();
                              if (!/^https?:\/\//i.test(v)) {
                                setUrlError(
                                  "URL must start with http:// or https://"
                                );
                                return;
                              }
                              onAddSocial(selectedPlatform, v);
                              setSelectedPlatform("");
                              setUrlValue("");
                              setUrlError("");
                              setSocialOpen(false);
                            }}
                          >
                            Save
                          </Button>
                          {profile?.socialLinks?.[selectedPlatform] && (
                            <Button
                              variant="destructive"
                              onClick={() => {
                                onDeleteSocial(selectedPlatform);
                                setSelectedPlatform("");
                                setUrlValue("");
                                setSocialOpen(false);
                              }}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Icon picker dialog with basic virtualization
function IconPickerDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPick: (name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ICON_SIZE = 80;
  const ICONS = useMemo(
    () => Object.keys(Tabler).filter((k) => k.startsWith("Icon")),
    []
  );
  const filtered = useMemo(
    () => ICONS.filter((k) => k.toLowerCase().includes(query.toLowerCase())),
    [ICONS, query]
  );
  const [scrollTop, setScrollTop] = useState(0);
  const visibleCount = 4 * 4; // 4 rows x 4 cols
  const itemsPerRow = 4;
  const rowHeight = ICON_SIZE + 24;
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);
  const endRow = startRow + 10; // buffer
  const startIndex = startRow * itemsPerRow;
  const endIndex = Math.min(filtered.length, (endRow + 1) * itemsPerRow);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Thumbnail</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Search icons"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div
            ref={containerRef}
            className="max-h-80 overflow-auto border rounded-lg p-2"
            onScroll={(e) =>
              setScrollTop((e.target as HTMLDivElement).scrollTop)
            }
          >
            <div
              style={{
                height: Math.ceil(filtered.length / itemsPerRow) * rowHeight,
              }}
              className="relative"
            >
              <div
                style={{
                  position: "absolute",
                  top: startRow * rowHeight,
                  left: 0,
                  right: 0,
                }}
                className="grid grid-cols-4 gap-3 p-2"
              >
                {filtered.slice(startIndex, endIndex).map((name) => {
                  const IconComp: any = (Tabler as any)[name];
                  return (
                    <Button
                      key={name}
                      variant="outline"
                      className="h-20"
                      onClick={() => onPick(name)}
                    >
                      <IconComp className="w-6 h-6" />
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Builder-style Link Card ---
function BuilderLinkCard({
  link,
  onUpdate,
  onDelete,
}: {
  link: any;
  onUpdate: (updates: Partial<any>) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingUrl, setEditingUrl] = useState(false);
  // per-card URL form with zod validation
  const UrlSchema = useMemo(
    () =>
      z.object({ url: z.string().url("URL must include http:// or https://") }),
    []
  );
  const urlForm = useForm<{ url: string }>({
    resolver: zodResolver(UrlSchema),
    defaultValues: { url: link.url || "" },
    mode: "onSubmit",
  });
  useEffect(() => {
    urlForm.reset({ url: link.url || "" });
  }, [link.url]);

  // dialogs local
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [thumbOpen, setThumbOpen] = useState(false);
  const [iconOpen, setIconOpen] = useState(false);
  const [tempStart, setTempStart] = useState<string>("");
  const [tempEnd, setTempEnd] = useState<string>("");
  const [tempPassword, setTempPassword] = useState<string>("");
  const [tempThumb, setTempThumb] = useState<string>("");

  useEffect(() => {
    setTempStart(
      link.scheduledStart
        ? new Date(link.scheduledStart).toISOString().slice(0, 16)
        : ""
    );
    setTempEnd(
      link.scheduledEnd
        ? new Date(link.scheduledEnd).toISOString().slice(0, 16)
        : ""
    );
    setTempPassword(link.password || "");
    setTempThumb(link.thumbnail || "");
  }, [link]);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 ${isDragging ? "opacity-50" : ""} ${
        !link.isActive ? "bg-muted/50" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </Button>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              {editingTitle ? (
                <Input
                  defaultValue={link.title}
                  onBlur={(e) => {
                    onUpdate({ title: e.target.value });
                    setEditingTitle(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value;
                      onUpdate({ title: val });
                      setEditingTitle(false);
                    }
                  }}
                  className="font-medium"
                  autoFocus
                />
              ) : (
                <h3
                  className="font-medium cursor-pointer hover:text-primary flex items-center gap-1"
                  onClick={() => setEditingTitle(true)}
                >
                  {link.title || "Untitled"}
                  <Edit2 className="w-3 h-3" />
                </h3>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={!!link.isActive}
                onCheckedChange={(checked) => onUpdate({ isActive: checked })}
              />
            </div>
          </div>

          {editingUrl ? (
            <Form {...(urlForm as any)}>
              <form
                onSubmit={urlForm.handleSubmit((values) => {
                  onUpdate({ url: values.url.trim() });
                  setEditingUrl(false);
                })}
              >
                <FormField
                  name={"url" as any}
                  control={urlForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://..."
                          onBlur={() =>
                            urlForm.handleSubmit((v) => {
                              onUpdate({ url: v.url.trim() });
                              setEditingUrl(false);
                            })()
                          }
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          ) : (
            <p
              className="text-sm text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1"
              onClick={() => setEditingUrl(true)}
            >
              {link.url || "URL"}
              <Edit2 className="w-3 h-3" />
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xs">0 clicks</span>
              <Button
                size={"sm"}
                variant={"ghost"}
                onClick={() => setScheduleOpen(true)}
              >
                <Calendar className="w-4 h-4" />
              </Button>
              <Button
                size={"sm"}
                variant={"ghost"}
                onClick={() => setPasswordOpen(true)}
              >
                <Lock className="w-4 h-4" />
              </Button>
              <Button
                size={"sm"}
                variant={"ghost"}
                onClick={() => setThumbOpen(true)}
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button
                size={"sm"}
                variant={"ghost"}
                onClick={() => setIconOpen(true)}
              >
                <IconIcons className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Schedule dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start</Label>
              <Input
                type="datetime-local"
                value={tempStart}
                onChange={(e) => setTempStart(e.target.value)}
              />
            </div>
            <div>
              <Label>End</Label>
              <Input
                type="datetime-local"
                value={tempEnd}
                onChange={(e) => setTempEnd(e.target.value)}
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <Button
                onClick={() => {
                  onUpdate({
                    scheduledStart: tempStart ? new Date(tempStart) : undefined,
                    scheduledEnd: tempEnd ? new Date(tempEnd) : undefined,
                  });
                  setScheduleOpen(false);
                }}
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setScheduleOpen(false)}
                className="bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              type="text"
              placeholder="Set a password"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  onUpdate({ password: tempPassword || undefined });
                  setPasswordOpen(false);
                }}
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setPasswordOpen(false)}
                className="bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Thumbnail dialog */}
      <Dialog open={thumbOpen} onOpenChange={setThumbOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thumbnail</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              type="url"
              placeholder="https://image.url"
              value={tempThumb}
              onChange={(e) => setTempThumb(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  onUpdate({ thumbnail: tempThumb || undefined });
                  setThumbOpen(false);
                }}
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setThumbOpen(false)}
                className="bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Icons dialog */}
      <IconPickerDialog
        open={iconOpen}
        onOpenChange={setIconOpen}
        onPick={(name) => {
          onUpdate({ icon: name });
          setIconOpen(false);
        }}
      />
    </Card>
  );
}

// Helpers for profile merge and links merge
function buildProfileUpdatePayload(
  base: any,
  updates: Partial<any>
): ProfileUpdateInput {
  const nz = (v: any) => (v === null ? undefined : v);
  return {
    id: nz(base.id),
    username: nz(base.username),
    displayName: nz(updates.displayName ?? base.displayName ?? base.username),
    bio: nz(updates.bio ?? base.bio),
    avatar: nz(updates.avatar ?? base.avatar),
    backgroundImage: nz(updates.backgroundImage ?? base.backgroundImage),
    isPublic: nz(updates.isPublic ?? base.isPublic ?? true),
    analyticsEnabled: nz(
      updates.analyticsEnabled ?? base.analyticsEnabled ?? true
    ),
    layoutTemplateId: nz(updates.layoutTemplateId ?? base.layoutTemplateId),
    colorSchemeId: nz(updates.colorSchemeId ?? base.colorSchemeId),
    customCss: nz(updates.customCss ?? base.customCss),
    socialLinks: nz(updates.socialLinks ?? base.socialLinks),
    seoTitle: nz(updates.seoTitle ?? base.seoTitle),
    seoDescription: nz(updates.seoDescription ?? base.seoDescription),
  } as ProfileUpdateInput;
}

function buildLinkUpdatePayload(
  link: any,
  updates: Partial<any>
): LinkUpdateInput {
  const nz = (v: any) => (v === null ? undefined : v);
  return {
    id: link.id,
    profileId: nz(link.profileId),
    title: nz(updates.title ?? link.title),
    url: nz(updates.url ?? link.url),
    description: nz(updates.description ?? link.description),
    linkType: nz(updates.linkType ?? link.linkType ?? "external"),
    productId: nz(updates.productId ?? link.productId),
    affiliateId: nz(updates.affiliateId ?? link.affiliateId),
    icon: nz(updates.icon ?? link.icon),
    thumbnail: nz(updates.thumbnail ?? link.thumbnail),
    isActive: nz(updates.isActive ?? link.isActive),
    openInNewTab: nz(updates.openInNewTab ?? link.openInNewTab),
    sortOrder: nz(updates.sortOrder ?? link.sortOrder),
    scheduledStart: nz(updates.scheduledStart ?? link.scheduledStart),
    scheduledEnd: nz(updates.scheduledEnd ?? link.scheduledEnd),
    clickLimit: nz(updates.clickLimit ?? link.clickLimit),
    password: nz(updates.password ?? link.password),
    buttonStyle: nz(updates.buttonStyle ?? link.buttonStyle),
  } as LinkUpdateInput;
}

export default function MicrositeStudioPage() {
  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Queries
  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: getProfiles,
  });
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null
  );
  useEffect(() => {
    if (profiles.length && !selectedProfileId)
      setSelectedProfileId(profiles[0].id);
  }, [profiles, selectedProfileId]);

  const { data: allLinks = [], isLoading: loadingLinks } = useQuery({
    queryKey: ["links"],
    queryFn: getLinks,
  });
  const links = useMemo(
    () =>
      selectedProfileId
        ? allLinks.filter((l: any) => l.profileId === selectedProfileId)
        : [],
    [allLinks, selectedProfileId]
  );

  const currentProfile = useMemo(
    () => profiles.find((p: any) => p.id === selectedProfileId) || profiles[0],
    [profiles, selectedProfileId]
  );

  // Mutations with optimistic updates
  const mutateProfile = useMutation({
    mutationFn: (payload: ProfileUpdateInput) => updateProfile(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["profiles"] });
      const previous = queryClient.getQueryData(["profiles"]) as
        | any[]
        | undefined;
      if (previous && payload?.id) {
        const next = previous.map((p) =>
          p.id === payload.id ? { ...p, ...payload } : p
        );
        queryClient.setQueryData(["profiles"], next);
      }
      return { previous };
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["profiles"], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["profiles"] }),
  });

  const mutateLink = useMutation({
    mutationFn: (payload: LinkUpdateInput) => updateLink(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["links"] });
      const previous = queryClient.getQueryData(["links"]) as any[] | undefined;
      if (previous && payload?.id) {
        const next = previous.map((l) =>
          l.id === payload.id ? { ...l, ...payload } : l
        );
        queryClient.setQueryData(["links"], next);
      }
      return { previous };
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["links"], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["links"] }),
  });

  const mutateCreateLink = useMutation({
    mutationFn: (payload: LinkCreateInput) => createLink(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["links"] });
      const previous = queryClient.getQueryData(["links"]) as any[] | undefined;
      if (previous) {
        const temp = { ...payload, id: `temp-${Date.now()}` } as any;
        queryClient.setQueryData(["links"], [...previous, temp]);
      }
      return { previous };
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["links"], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["links"] }),
  });

  const mutateDeleteLink = useMutation({
    mutationFn: (id: string) => deleteLink(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["links"] });
      const previous = queryClient.getQueryData(["links"]) as any[] | undefined;
      if (previous)
        queryClient.setQueryData(
          ["links"],
          previous.filter((l) => l.id !== id)
        );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["links"], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["links"] }),
  });

  // DnD
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  useEffect(() => {
    setOrderedIds(
      [...links]
        .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((l: any) => l.id)
    );
  }, [links]);

  async function onDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrderedIds((ids) => {
      const oldIndex = ids.indexOf(active.id);
      const newIndex = ids.indexOf(over.id);
      const next = arrayMove(ids, oldIndex, newIndex);
      // persist order immediately
      next.forEach((id, idx) => {
        const link = links.find((l: any) => l.id === id);
        if (link && link.sortOrder !== idx) {
          const payload = buildLinkUpdatePayload(link, { sortOrder: idx });
          if (
            payload.linkType === "product" ||
            payload.linkType === "affiliate"
          )
            payload.url = undefined;
          mutateLink.mutate(payload);
        }
      });
      return next;
    });
  }

  // Add link dialog with shadcn form wrappers
  const addForm = useForm<LinkCreateInput>({
    resolver: zodResolver(
      z.object({
        title: z.string().min(1),
        url: z.string().url("URL must include http:// or https://"),
      })
    ),
    defaultValues: {
      profileId: "",
      title: "",
      url: "",
      linkType: "external",
      isActive: true,
      openInNewTab: true,
      sortOrder: 0,
    } as any,
  });
  const [addOpen, setAddOpen] = useState(false);
  const isLoading = loadingProfiles || loadingLinks;
  const publicUrl = currentProfile?.username
    ? `http://localhost:3000/${currentProfile.username}`
    : "#";

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Microsite Builder</h2>
          {currentProfile?.username && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline"
            >
              {publicUrl}
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries()}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <ProfileSection
            profile={currentProfile}
            onUpdate={(updates) =>
              mutateProfile.mutate(
                buildProfileUpdatePayload(currentProfile || {}, updates)
              )
            }
            onAddSocial={(platform, value) => {
              const prev = currentProfile?.socialLinks || {};
              mutateProfile.mutate(
                buildProfileUpdatePayload(currentProfile || {}, {
                  socialLinks: { ...prev, [platform]: value },
                })
              );
            }}
            onDeleteSocial={(platform) => {
              const prev = { ...(currentProfile?.socialLinks || {}) };
              delete prev[platform];
              mutateProfile.mutate(
                buildProfileUpdatePayload(currentProfile || {}, {
                  socialLinks: prev,
                })
              );
            }}
          />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Links</CardTitle>
              <div className="flex items-center gap-2">
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Add Link</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Link</DialogTitle>
                    </DialogHeader>
                    <Form {...(addForm as any)}>
                      <form
                        onSubmit={addForm.handleSubmit(async (values) => {
                          if (!selectedProfileId) return;
                          const payload: LinkCreateInput = {
                            ...values,
                            profileId: selectedProfileId,
                            linkType: values.linkType || "external",
                          } as any;
                          // simple client-side rule
                          if (payload.linkType === "external" && !payload.url)
                            return;
                          await mutateCreateLink.mutateAsync(payload);
                          addForm.reset({
                            profileId: selectedProfileId,
                            title: "",
                            url: "",
                            linkType: "external",
                            isActive: true,
                            openInNewTab: true,
                            sortOrder: links.length,
                          } as any);
                          setAddOpen(false);
                        })}
                        className="grid grid-cols-2 gap-3"
                      >
                        <FormField
                          name={"title" as any}
                          control={addForm.control}
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input {...field} required />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name={"url" as any}
                          control={addForm.control}
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>URL</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="col-span-2 flex items-center gap-2">
                          <Button
                            type="submit"
                            disabled={!addForm.watch("title")?.trim()}
                          >
                            Create
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setAddOpen(false)}
                            className="bg-transparent"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={orderedIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {orderedIds.map((id) => {
                      const l = links.find((x: any) => x.id === id);
                      if (!l) return null;
                      return (
                        <BuilderLinkCard
                          key={l.id}
                          link={l}
                          onUpdate={(updates) => {
                            const payload = buildLinkUpdatePayload(l, updates);
                            if (
                              payload.linkType === "product" ||
                              payload.linkType === "affiliate"
                            )
                              payload.url = undefined;
                            mutateLink.mutate(payload);
                          }}
                          onDelete={() => mutateDeleteLink.mutate(l.id)}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="w-64 h-[500px] bg-black rounded-[2.5rem] p-2 mx-auto">
                  <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-full"></div>
                    <div className="pt-10 px-6 pb-6 h-full overflow-y-auto">
                      <div className="text-center space-y-4">
                        <Avatar className="w-20 h-20 mx-auto">
                          <AvatarImage
                            src={currentProfile?.avatar || "/placeholder.svg"}
                            alt={
                              currentProfile?.displayName ||
                              currentProfile?.username
                            }
                          />
                          <AvatarFallback>
                            {(
                              currentProfile?.displayName ||
                              currentProfile?.username ||
                              ""
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="text-lg font-semibold text-primary">
                            {currentProfile?.displayName ||
                              currentProfile?.username}
                          </h2>
                          {currentProfile?.bio && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {currentProfile.bio}
                            </p>
                          )}
                          {/* Social links row */}
                          <div className="flex justify-center gap-2 pt-2">
                            {Object.entries(
                              currentProfile?.socialLinks || {}
                            ).map(([platform, url]: any) => {
                              const map: Record<string, any> = {
                                instagram: Instagram,
                                tiktok: Music,
                                youtube: Youtube,
                                email: Mail,
                                facebook: Facebook,
                                twitter: Twitter,
                                linkedin: Linkedin,
                                github: Github,
                                telegram: Send,
                                whatsapp: MessageCircle,
                              };
                              const Icon = map[platform];
                              return (
                                <Button
                                  key={platform}
                                  asChild
                                  variant="outline"
                                  size="icon"
                                  className="w-8 h-8 rounded-full border-2"
                                >
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {Icon && <Icon className="w-4 h-4" />}
                                  </a>
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="space-y-3">
                          {[...links]
                            .filter((l: any) => l.isActive)
                            .sort(
                              (a: any, b: any) =>
                                (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
                            )
                            .map((link: any) => {
                              const TablerIcon: any = (Tabler as any)[
                                link.icon || ""
                              ];
                              return (
                                <Button
                                  key={link.id}
                                  asChild
                                  variant="outline"
                                  className="w-full py-3 text-sm font-medium rounded-full border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary bg-transparent flex items-center gap-2 justify-center"
                                  style={{
                                    backgroundColor:
                                      link.buttonStyle?.backgroundColor ||
                                      "transparent",
                                    color:
                                      link.buttonStyle?.textColor || "inherit",
                                    borderRadius:
                                      link.buttonStyle?.borderRadius ||
                                      "9999px",
                                  }}
                                >
                                  <a
                                    href={link.url || "#"}
                                    target={
                                      link.openInNewTab ? "_blank" : "_self"
                                    }
                                    rel={
                                      link.openInNewTab
                                        ? "noopener noreferrer"
                                        : undefined
                                    }
                                  >
                                    <span className="inline-flex items-center gap-2">
                                      {link.thumbnail && (
                                        <img
                                          src={link.thumbnail}
                                          alt="thumb"
                                          className="w-5 h-5 rounded"
                                        />
                                      )}
                                      {TablerIcon && (
                                        <TablerIcon className="w-4 h-4" />
                                      )}
                                      {link.title}
                                    </span>
                                  </a>
                                </Button>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
