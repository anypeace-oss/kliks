"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  createBlock,
  deleteBlock,
  getBlocks,
  getProfiles,
  updateBlock,
  updateProfile,
} from "@/lib/api";
import type {
  BlockCreateInput,
  BlockUpdateInput,
  ProfileUpdateInput,
} from "@/lib/validation/link-in-bio";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// Type definitions for microsite components
interface ProfileData {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  backgroundImage?: string;
  isPublic: boolean;
  analyticsEnabled?: boolean;
  layoutTemplateId?: string;
  colorSchemeId?: string;
  customCss?: string;
  socialLinks?: Record<string, string>;
  seoTitle?: string;
  seoDescription?: string;
}

interface BlockData {
  id: string;
  profileId: string;
  type: string;
  title: string | null;
  url: string | null;
  description: string | null;
  isActive: boolean;
  openInNewTab: boolean | null;
  sortOrder: number;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  productId: string | null;
  affiliateId: string | null;
  config: {
    icon?: string;
    thumbnail?: string;
    imageUrl?: string;
    alt?: string;
    text?: string;
    buttonStyle?: {
      backgroundColor?: string;
      textColor?: string;
      borderRadius?: string;
    };
    separatorStyle?: string;
    separatorHeight?: number;
    separatorColor?: string;
    [key: string]: unknown;
  } | null;
  clickLimit: number | null;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SocialIconMap {
  [key: string]: React.ComponentType<{ className?: string }>;
}

// --- Inline Profile Section (editable displayName, bio, avatar) + social bar ---
function ProfileSection({
  profile,
  onUpdate,
  onAddSocial,
  onDeleteSocial,
}: {
  profile: ProfileData;
  onUpdate: (updates: Partial<ProfileData>) => void;
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
    const map: SocialIconMap = {
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
                  const IconComp = (
                    Tabler as unknown as Record<
                      string,
                      React.ComponentType<{ className?: string }>
                    >
                  )[name];
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
  block,
  onUpdate,
  onDelete,
  onSave,
}: {
  block: BlockData;
  onUpdate: (updates: Partial<BlockData>) => void;
  onDelete: () => void;
  onSave: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });
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
    defaultValues: { url: block.url || "" },
    mode: "onSubmit",
  });
  useEffect(() => {
    urlForm.reset({ url: block.url || "" });
  }, [block.url, urlForm]);

  // dialogs local
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [thumbOpen, setThumbOpen] = useState(false);
  const [iconOpen, setIconOpen] = useState(false);
  const [tempStart, setTempStart] = useState<string>("");
  const [tempEnd, setTempEnd] = useState<string>("");
  const [tempPassword, setTempPassword] = useState<string>("");
  const [tempThumb, setTempThumb] = useState<string>("");

  // extra local for image/separator config
  const [imageUrlDraft, setImageUrlDraft] = useState<string>("");
  const [imageAltDraft, setImageAltDraft] = useState<string>("");
  const [sepStyle, setSepStyle] = useState<"transparent" | "bordered">(
    "transparent"
  );
  const [sepHeight, setSepHeight] = useState<number>(8);
  const [sepColor, setSepColor] = useState<string>("#e5e7eb");

  useEffect(() => {
    setTempStart(
      block.scheduledStart
        ? new Date(block.scheduledStart).toISOString().slice(0, 16)
        : ""
    );
    setTempEnd(
      block.scheduledEnd
        ? new Date(block.scheduledEnd).toISOString().slice(0, 16)
        : ""
    );
    setTempPassword(block.password || "");
    setTempThumb(block.config?.thumbnail || "");
    setImageUrlDraft(block.config?.imageUrl || block.config?.thumbnail || "");
    setImageAltDraft(block.config?.alt || "");
    setSepStyle(
      block.config?.separatorStyle === "bordered" ? "bordered" : "transparent"
    );
    setSepHeight(block.config?.separatorHeight || 8);
    setSepColor(block.config?.separatorColor || "#e5e7eb");
  }, [block]);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 ${isDragging ? "opacity-50" : ""} ${
        !block.isActive ? "bg-muted/50" : ""
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
                  defaultValue={block.title || ""}
                  onBlur={(e) => {
                    onUpdate({ title: e.target.value });
                    setEditingTitle(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value;
                      onUpdate({ title: val });
                      setEditingTitle(false);
                      onSave();
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
                  {block.title ||
                    (block.type === "separator" ? "Separator" : "Untitled")}
                  <Edit2 className="w-3 h-3" />
                </h3>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={!!block.isActive}
                onCheckedChange={(checked) => onUpdate({ isActive: checked })}
              />
            </div>
          </div>

          {/* Per-type editors */}
          {block.type === "link" && (
            <Form {...urlForm}>
              <form
                onSubmit={urlForm.handleSubmit((values) => {
                  onUpdate({ url: values.url.trim() });
                  setEditingUrl(false);
                  onSave();
                })}
              >
                {editingUrl ? (
                  <FormField
                    name="url"
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
                ) : (
                  <p
                    className="text-sm text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1"
                    onClick={() => setEditingUrl(true)}
                  >
                    {block.url || "URL"}
                    <Edit2 className="w-3 h-3" />
                  </p>
                )}
              </form>
            </Form>
          )}

          {block.type === "text" && (
            <Textarea
              value={block.config?.text || ""}
              placeholder="Write some text..."
              onChange={(e) =>
                onUpdate({
                  config: { ...(block.config || {}), text: e.target.value },
                })
              }
            />
          )}

          {block.type === "image" && (
            <div className="grid gap-2">
              <Input
                value={imageUrlDraft}
                placeholder="https://image.url"
                onChange={(e) => setImageUrlDraft(e.target.value)}
                onBlur={() =>
                  onUpdate({
                    config: {
                      ...(block.config || {}),
                      imageUrl: imageUrlDraft || undefined,
                    },
                  })
                }
              />
              <Input
                value={imageAltDraft}
                placeholder="Alt text"
                onChange={(e) => setImageAltDraft(e.target.value)}
                onBlur={() =>
                  onUpdate({
                    config: {
                      ...(block.config || {}),
                      alt: imageAltDraft || undefined,
                    },
                  })
                }
              />
            </div>
          )}

          {block.type === "separator" && (
            <div className="grid grid-cols-3 gap-2 items-end">
              <div className="col-span-3 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={sepStyle === "transparent" ? "default" : "outline"}
                  onClick={() => {
                    setSepStyle("transparent");
                    onUpdate({
                      config: {
                        ...(block.config || {}),
                        separatorStyle: "transparent",
                      },
                    });
                  }}
                >
                  Transparent
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={sepStyle === "bordered" ? "default" : "outline"}
                  onClick={() => {
                    setSepStyle("bordered");
                    onUpdate({
                      config: {
                        ...(block.config || {}),
                        separatorStyle: "bordered",
                      },
                    });
                  }}
                >
                  Bordered
                </Button>
              </div>
              <div>
                <Label className="text-xs">Height</Label>
                <Input
                  type="number"
                  value={sepHeight}
                  onChange={(e) => {
                    const v = Number(e.target.value || 0);
                    setSepHeight(v);
                    onUpdate({
                      config: { ...(block.config || {}), separatorHeight: v },
                    });
                  }}
                />
              </div>
              <div>
                <Label className="text-xs">Color</Label>
                <Input
                  type="color"
                  value={sepColor}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSepColor(v);
                    onUpdate({
                      config: { ...(block.config || {}), separatorColor: v },
                    });
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xs">0 clicks</span>
              {block.type !== "separator" && (
                <Button
                  size={"sm"}
                  variant={"ghost"}
                  onClick={() => setScheduleOpen(true)}
                >
                  <Calendar className="w-4 h-4" />
                </Button>
              )}
              {block.type !== "text" && block.type !== "separator" && (
                <Button
                  size={"sm"}
                  variant={"ghost"}
                  onClick={() => setPasswordOpen(true)}
                >
                  <Lock className="w-4 h-4" />
                </Button>
              )}
              {block.type !== "separator" && (
                <Button
                  size={"sm"}
                  variant={"ghost"}
                  onClick={() => setThumbOpen(true)}
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
              )}
              {block.type !== "separator" && (
                <Button
                  size={"sm"}
                  variant={"ghost"}
                  onClick={() => setIconOpen(true)}
                >
                  <IconIcons className="w-4 h-4" />
                </Button>
              )}
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
      {/* dialogs remain */}
      {/* Schedule */}
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

      {/* Password (hidden for text/separator via toolbar) */}
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onUpdate({ password: tempPassword || undefined });
                  setPasswordOpen(false);
                  onSave();
                }
              }}
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

      {/* Thumbnail */}
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onUpdate({
                    config: {
                      ...(block.config || {}),
                      thumbnail: tempThumb || undefined,
                    },
                  });
                  setThumbOpen(false);
                  onSave();
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  onUpdate({
                    config: {
                      ...(block.config || {}),
                      thumbnail: tempThumb || undefined,
                    },
                  });
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

      {/* Icons */}
      <IconPickerDialog
        open={iconOpen}
        onOpenChange={setIconOpen}
        onPick={(name) => {
          onUpdate({ config: { ...(block.config || {}), icon: name } });
          setIconOpen(false);
        }}
      />
    </Card>
  );
}

// Helpers for profile merge and blocks merge
function buildProfileUpdatePayload(
  base: ProfileData,
  updates: Partial<ProfileData>
): ProfileUpdateInput {
  const nz = (v: unknown) => (v === null ? undefined : v);
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

function buildBlockUpdatePayload(
  block: BlockData,
  updates: Partial<BlockData>
): BlockUpdateInput {
  const nz = (v: unknown) => (v === null ? undefined : v);
  // Merge config if provided in updates
  const mergedConfig = updates.config
    ? {
        ...(block.config || {}),
        ...(updates.config as Record<string, unknown>),
      }
    : block.config;
  return {
    id: block.id,
    profileId: nz(block.profileId),
    title: nz(updates.title ?? block.title),
    url: nz(updates.url ?? block.url),
    description: nz(updates.description ?? block.description),
    type: nz(updates.type ?? block.type ?? "link"),
    productId: nz(updates.productId ?? block.productId),
    affiliateId: nz(updates.affiliateId ?? block.affiliateId),
    config: nz(mergedConfig),
    isActive: nz(updates.isActive ?? block.isActive),
    openInNewTab: nz(updates.openInNewTab ?? block.openInNewTab),
    sortOrder: nz(updates.sortOrder ?? block.sortOrder),
    scheduledStart: nz(updates.scheduledStart ?? block.scheduledStart),
    scheduledEnd: nz(updates.scheduledEnd ?? block.scheduledEnd),
    clickLimit: nz(updates.clickLimit ?? block.clickLimit),
    password: nz(updates.password ?? block.password),
  } as BlockUpdateInput;
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
  }) as { data: ProfileData[]; isLoading: boolean };
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null
  );
  useEffect(() => {
    if (profiles.length && !selectedProfileId)
      setSelectedProfileId(profiles[0].id);
  }, [profiles, selectedProfileId]);

  const { data: allBlocks = [], isLoading: loadingBlocks } = useQuery({
    queryKey: ["blocks"],
    queryFn: getBlocks,
  });
  const blocks = useMemo(
    () =>
      selectedProfileId
        ? (allBlocks as BlockData[]).filter(
            (b: BlockData) => b.profileId === selectedProfileId
          )
        : [],
    [allBlocks, selectedProfileId]
  );

  const currentProfile = useMemo(
    () => profiles.find((p) => p.id === selectedProfileId) || profiles[0],
    [profiles, selectedProfileId]
  );

  // Mutations with optimistic updates
  const mutateProfile = useMutation({
    mutationFn: (payload: ProfileUpdateInput) => updateProfile(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["profiles"] });
      const previous = queryClient.getQueryData(["profiles"]) as
        | ProfileData[]
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

  const mutateBlock = useMutation({
    mutationFn: (payload: BlockUpdateInput) => updateBlock(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["blocks"] });
      const previous = queryClient.getQueryData(["blocks"]) as
        | BlockData[]
        | undefined;
      if (previous && payload?.id) {
        const next = previous.map((b) =>
          b.id === payload.id ? { ...b, ...payload } : b
        );
        queryClient.setQueryData(["blocks"], next);
      }
      return { previous };
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["blocks"], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["blocks"] }),
  });

  const mutateCreateBlock = useMutation({
    mutationFn: (payload: BlockCreateInput) => createBlock(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["blocks"] });
      const previous = queryClient.getQueryData(["blocks"]) as
        | BlockData[]
        | undefined;
      if (previous) {
        const temp = { ...payload, id: `temp-${Date.now()}` } as BlockData;
        queryClient.setQueryData(["blocks"], [...previous, temp]);
      }
      return { previous };
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["blocks"], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["blocks"] }),
  });

  const mutateDeleteBlock = useMutation({
    mutationFn: (id: string) => deleteBlock(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["blocks"] });
      const previous = queryClient.getQueryData(["blocks"]) as
        | BlockData[]
        | undefined;
      if (previous)
        queryClient.setQueryData(
          ["blocks"],
          previous.filter((b) => b.id !== id)
        );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["blocks"], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["blocks"] }),
  });

  // Pending updates queue to avoid too many posts
  const [pendingBlockUpdates, setPendingBlockUpdates] = useState<
    Record<string, Partial<BlockData>>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  function applyBlockUpdateLocal(
    block: BlockData,
    updates: Partial<BlockData>
  ) {
    // update local cache for instant UX
    queryClient.setQueryData(["blocks"], (prev: BlockData[] | undefined) => {
      if (!prev) return prev;
      return prev.map((b) =>
        b.id === block.id
          ? {
              ...b,
              ...updates,
              config: updates.config
                ? {
                    ...(b.config || {}),
                    ...(updates.config as Record<string, unknown>),
                  }
                : b.config,
            }
          : b
      );
    });
    // queue pending
    setPendingBlockUpdates((prev) => ({
      ...prev,
      [block.id]: {
        ...(prev[block.id] || {}),
        ...updates,
        config: updates.config
          ? {
              ...(prev[block.id]?.config || {}),
              ...(updates.config as Record<string, unknown>),
            }
          : (prev[block.id]?.config as Record<string, unknown>),
      },
    }));
  }

  async function saveOneBlock(blockId: string) {
    const pending = pendingBlockUpdates[blockId];
    if (!pending) return;
    const current = (
      queryClient.getQueryData(["blocks"]) as BlockData[] | undefined
    )?.find((b) => b.id === blockId);
    if (!current) return;
    const payload = buildBlockUpdatePayload(current, pending);
    if (payload.type === "product" || payload.type === "affiliate")
      payload.url = undefined;
    await mutateBlock.mutateAsync(payload);
    setPendingBlockUpdates((prev) => {
      const next = { ...prev };
      delete next[blockId];
      return next;
    });
  }

  async function saveAllPending() {
    const ids = Object.keys(pendingBlockUpdates);
    if (!ids.length) return;
    setIsSaving(true);
    for (const id of ids) {
      await saveOneBlock(id);
    }
    setIsSaving(false);
  }

  // DnD
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  useEffect(() => {
    const nextIds = [...blocks]
      .sort(
        (a: BlockData, b: BlockData) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      )
      .map((l: BlockData) => l.id);
    setOrderedIds((prev) => {
      if (
        prev.length === nextIds.length &&
        prev.every((id, i) => id === nextIds[i])
      ) {
        return prev;
      }
      return nextIds;
    });
  }, [blocks]);

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrderedIds((ids) => {
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      const next = arrayMove(ids, oldIndex, newIndex);
      // update local order and queue pending
      next.forEach((id, idx) => {
        const block = blocks.find((l: BlockData) => l.id === id);
        if (block && block.sortOrder !== idx) {
          applyBlockUpdateLocal(block, { sortOrder: idx });
        }
      });
      return next;
    });
  }

  // Add block dialog with type selector
  const addForm = useForm<{
    type: "link" | "text" | "separator" | "image";
    title?: string;
    url?: string;
    text?: string;
    imageUrl?: string;
    alt?: string;
  }>({
    resolver: zodResolver(
      z
        .object({
          type: z.enum(["link", "text", "separator", "image"]),
          title: z.string().optional(),
          url: z
            .string()
            .url("URL must include http:// or https://")
            .optional(),
          text: z.string().optional(),
          imageUrl: z.string().url("Must be a valid URL").optional(),
          alt: z.string().optional(),
        })
        .refine(
          (v) => {
            if (v.type === "link") return !!v.title && !!v.url;
            if (v.type === "text") return !!v.text;
            if (v.type === "image") return !!v.imageUrl;
            return true; // separator
          },
          { message: "Fill required fields for selected block type" }
        )
    ),
    defaultValues: { type: "link" },
  });

  const [addOpen, setAddOpen] = useState(false);
  const isLoading = loadingProfiles || loadingBlocks;
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
              <CardTitle>Blocks</CardTitle>
              <div className="flex items-center gap-2">
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Add Block</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Block</DialogTitle>
                    </DialogHeader>
                    <Form {...addForm}>
                      <form
                        onSubmit={addForm.handleSubmit(async (values) => {
                          if (!selectedProfileId) return;
                          const base = {
                            profileId: selectedProfileId,
                            sortOrder: blocks.length,
                          };
                          let payload: BlockCreateInput;
                          if (values.type === "link") {
                            payload = {
                              ...base,
                              type: "link",
                              title: values.title!,
                              url: values.url!,
                              isActive: true,
                              openInNewTab: true,
                            };
                          } else if (values.type === "text") {
                            payload = {
                              ...base,
                              type: "text",
                              title: values.title,
                              url: undefined,
                              config: { text: values.text },
                            };
                          } else if (values.type === "image") {
                            payload = {
                              ...base,
                              type: "image",
                              title: values.title,
                              url: undefined,
                              config: {
                                imageUrl: values.imageUrl,
                                alt: values.alt,
                              },
                            };
                          } else {
                            payload = {
                              ...base,
                              type: "separator",
                              url: undefined,
                            };
                          }
                          await mutateCreateBlock.mutateAsync(payload);
                          addForm.reset({ type: "link" });
                          setAddOpen(false);
                        })}
                        className="grid grid-cols-2 gap-3"
                      >
                        {/* Type selector */}
                        <FormField
                          name="type"
                          control={addForm.control}
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Type</FormLabel>
                              <div className="flex gap-2">
                                {(
                                  [
                                    "link",
                                    "text",
                                    "separator",
                                    "image",
                                  ] as const
                                ).map((t) => (
                                  <Button
                                    key={t}
                                    type="button"
                                    variant={
                                      field.value === t ? "default" : "outline"
                                    }
                                    onClick={() => addForm.setValue("type", t)}
                                  >
                                    {t}
                                  </Button>
                                ))}
                              </div>
                            </FormItem>
                          )}
                        />

                        {/* Conditional fields */}
                        {addForm.watch("type") === "link" && (
                          <>
                            <FormField
                              name="title"
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
                              name="url"
                              control={addForm.control}
                              render={({ field }) => (
                                <FormItem className="col-span-2">
                                  <FormLabel>URL</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="https://..."
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}

                        {addForm.watch("type") === "text" && (
                          <>
                            <FormField
                              name="title"
                              control={addForm.control}
                              render={({ field }) => (
                                <FormItem className="col-span-2">
                                  <FormLabel>Title (optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              name="text"
                              control={addForm.control}
                              render={({ field }) => (
                                <FormItem className="col-span-2">
                                  <FormLabel>Text</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      {...field}
                                      placeholder="Your text..."
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}

                        {addForm.watch("type") === "image" && (
                          <>
                            <FormField
                              name="title"
                              control={addForm.control}
                              render={({ field }) => (
                                <FormItem className="col-span-2">
                                  <FormLabel>Title (optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              name="imageUrl"
                              control={addForm.control}
                              render={({ field }) => (
                                <FormItem className="col-span-2">
                                  <FormLabel>Image URL</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="https://..."
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              name="alt"
                              control={addForm.control}
                              render={({ field }) => (
                                <FormItem className="col-span-2">
                                  <FormLabel>Alt text (optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}

                        <div className="col-span-2 flex items-center gap-2">
                          <Button type="submit">Create</Button>
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
                      const b = blocks.find((x: BlockData) => x.id === id);
                      if (!b) return null;
                      return (
                        <BuilderLinkCard
                          key={b.id}
                          block={b}
                          onUpdate={(updates) =>
                            applyBlockUpdateLocal(b, updates)
                          }
                          onDelete={() => mutateDeleteBlock.mutate(b.id)}
                          onSave={() => saveOneBlock(b.id)}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>

          {/* Sticky Save Bar */}
          <div className="sticky bottom-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t mt-4 p-3 flex justify-end">
            <Button
              onClick={saveAllPending}
              disabled={isSaving || !Object.keys(pendingBlockUpdates).length}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Preview column unchanged except rendering blocks */}
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
                            ).map(([platform, url]: [string, string]) => {
                              const map: SocialIconMap = {
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
                          {[...blocks]
                            .filter((l: BlockData) => l.isActive)
                            .sort(
                              (a: BlockData, b: BlockData) =>
                                (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
                            )
                            .map((block: BlockData) => {
                              const cfg = block.config || {};
                              if (block.type === "separator") {
                                return (
                                  <hr
                                    key={block.id}
                                    className="border-gray-200"
                                  />
                                );
                              }
                              if (block.type === "text") {
                                return (
                                  <div
                                    key={block.id}
                                    className="text-sm text-foreground"
                                  >
                                    {cfg.text || block.title}
                                  </div>
                                );
                              }
                              if (block.type === "image") {
                                const src = cfg.imageUrl || cfg.thumbnail;
                                if (!src) return null;
                                return (
                                  <Image
                                    key={block.id}
                                    src={src}
                                    alt={cfg.alt || block.title || "image"}
                                    className="w-full rounded-lg"
                                    width={240}
                                    height={160}
                                  />
                                );
                              }
                              const TablerIcon = cfg.icon
                                ? (
                                    Tabler as unknown as Record<
                                      string,
                                      React.ComponentType<{
                                        className?: string;
                                      }>
                                    >
                                  )[cfg.icon]
                                : undefined;
                              return (
                                <Button
                                  key={block.id}
                                  asChild
                                  variant="outline"
                                  className="w-full py-3 text-sm font-medium rounded-full border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary bg-transparent flex items-center gap-2 justify-center"
                                  style={{
                                    backgroundColor:
                                      cfg.buttonStyle?.backgroundColor ||
                                      "transparent",
                                    color:
                                      cfg.buttonStyle?.textColor || "inherit",
                                    borderRadius:
                                      cfg.buttonStyle?.borderRadius || "9999px",
                                  }}
                                >
                                  <a
                                    href={block.url || "#"}
                                    target={
                                      block.openInNewTab ? "_blank" : "_self"
                                    }
                                    rel={
                                      block.openInNewTab
                                        ? "noopener noreferrer"
                                        : undefined
                                    }
                                  >
                                    <span className="inline-flex items-center gap-2">
                                      {cfg.thumbnail && (
                                        <Image
                                          src={cfg.thumbnail}
                                          alt="thumb"
                                          className="w-5 h-5 rounded"
                                          width={20}
                                          height={20}
                                        />
                                      )}
                                      {TablerIcon && (
                                        <TablerIcon className="w-4 h-4" />
                                      )}
                                      {block.title}
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
