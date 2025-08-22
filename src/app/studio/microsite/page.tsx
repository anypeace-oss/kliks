"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  createLink,
  deleteLink,
  getLinks,
  getProfiles,
  updateLink,
  updateProfile,
  checkUsernameAvailability,
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
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Save,
  Copy,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Design components
import { LayoutSelector } from "./components/LayoutSelector";
import { ThemeSelector } from "./components/ThemeSelector";
import { ButtonVariantSelector } from "./components/ButtonVariantSelector";

// Types
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
  // Design variant fields
  layoutVariant?: "default" | "store";
  schemeVariant?: "theme1" | "theme2";
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

interface LinkData {
  id: string;
  profileId: string;
  title: string;
  url: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SocialIconMap {
  [key: string]: React.ComponentType<{ className?: string }>;
}

interface PendingChanges {
  profile: Partial<ProfileData>;
  links: Record<string, Partial<LinkData>>;
  hasChanges: boolean;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      error?: string;
    };
    status?: number;
  };
}

// Design-related types
type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

// Validation schemas
const ProfileSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  bio: z.string().optional(),
  socialLinks: z.record(z.string(), z.string()).optional(),
  // Design variant fields
  layoutVariant: z.enum(["default", "store"]).optional().default("default"),
  schemeVariant: z.enum(["theme1", "theme2"]).optional().default("theme1"),
  buttonVariant: z.enum(["default", "destructive", "outline", "secondary", "ghost", "link"]).optional().default("default"),
});

const LinkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z
    .string()
    .url("Please enter a valid URL (including http:// or https://)"),
});

// Profile Section Component
function ProfileSection({
  profile,
  pendingProfile,
  onUpdate,
  onUsernameUpdate,
}: {
  profile: ProfileData;
  pendingProfile: Partial<ProfileData>;
  onUpdate: (updates: Partial<ProfileData>) => void;
  onUsernameUpdate: (newUsername: string) => Promise<boolean>;
}) {
  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [urlValue, setUrlValue] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const form = useForm({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      displayName: profile?.displayName || profile?.username || "",
      bio: profile?.bio || "",
      socialLinks: profile?.socialLinks || {},
      layoutVariant: profile?.layoutVariant || "default",
      schemeVariant: profile?.schemeVariant || "theme1",
      buttonVariant: profile?.buttonVariant || "default",
    },
  });

  const { watch, setValue } = form;
  const formData = watch();

  // Track initial values to prevent unnecessary updates
  const initialValuesRef = useRef<{
    displayName: string;
    bio: string;
    socialLinks: Record<string, string>;
    layoutVariant: "default" | "store";
    schemeVariant: "theme1" | "theme2";
    buttonVariant: ButtonVariant;
  }>({ 
    displayName: "", 
    bio: "", 
    socialLinks: {},
    layoutVariant: "default",
    schemeVariant: "theme1",
    buttonVariant: "default"
  });

  // Real-time updates
  useEffect(() => {
    if (profile) {
      const newValues = {
        displayName: profile.displayName || profile.username || "",
        bio: profile.bio || "",
        socialLinks: profile.socialLinks || {},
        layoutVariant: profile.layoutVariant || "default",
        schemeVariant: profile.schemeVariant || "theme1",
        buttonVariant: profile.buttonVariant || "default",
      };

      form.reset(newValues);
      initialValuesRef.current = newValues;
    }
  }, [profile, form]);

  // Only update when values actually change
  useEffect(() => {
    const current = {
      displayName: formData.displayName,
      bio: formData.bio,
      socialLinks:
        (formData.socialLinks as Record<string, string> | undefined) || {},
      layoutVariant: (formData.layoutVariant as "default" | "store") || "default",
      schemeVariant: (formData.schemeVariant as "theme1" | "theme2") || "theme1",
      buttonVariant: (formData.buttonVariant as ButtonVariant) || "default",
    };

    const initial = initialValuesRef.current;

    // Check if values have actually changed from initial values
    const hasChanged =
      current.displayName !== initial.displayName ||
      current.bio !== initial.bio ||
      JSON.stringify(current.socialLinks) !==
        JSON.stringify(initial.socialLinks) ||
      current.layoutVariant !== initial.layoutVariant ||
      current.schemeVariant !== initial.schemeVariant ||
      current.buttonVariant !== initial.buttonVariant;

    if (hasChanged) {
      onUpdate(current);
    }
  }, [formData.displayName, formData.bio, formData.socialLinks, formData.layoutVariant, formData.schemeVariant, formData.buttonVariant, onUpdate]);

  const socialPlatforms = [
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

  const socialIcons: SocialIconMap = {
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

  const filteredPlatforms = socialPlatforms.filter((p) =>
    p.label.toLowerCase().includes(search.toLowerCase())
  );

  const currentUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/${profile?.username}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopySuccess(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
      throw error;
    }
  };

  // Debounced username validation
  useEffect(() => {
    if (!newUsername.trim() || newUsername.trim() === profile?.username) {
      setUsernameError("");
      setUsernameAvailable(null);
      return;
    }

    if (newUsername.trim().length < 3) {
      setUsernameError("Username must be at least 3 characters");
      setUsernameAvailable(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingUsername(true);
      setUsernameError("");
      
      try {
        const result = await checkUsernameAvailability(newUsername.trim(), profile?.id);
        
        if (result.available) {
          setUsernameAvailable(true);
          setUsernameError("");
        } else {
          setUsernameAvailable(false);
          setUsernameError("Username is already taken");
        }
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameError("Failed to check username availability");
        setUsernameAvailable(false);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [newUsername, profile?.username, profile?.id]);

  const handleUsernameSubmit = async () => {
    if (!newUsername.trim() || !usernameAvailable || confirmationText !== "YAKIN") {
      return;
    }

    setIsUpdatingUsername(true);

    try {
      const success = await onUsernameUpdate(newUsername.trim());
      
      if (success) {
        setUsernameDialogOpen(false);
        setNewUsername("");
        setConfirmationText("");
        setUsernameError("");
        setUsernameAvailable(null);
      }
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handlePublicToggle = (isPublic: boolean) => {
    onUpdate({ isPublic });
  };

  const addSocial = () => {
    const trimmedUrl = urlValue.trim();
    if (!trimmedUrl || !selectedPlatform) return;

    if (!/^https?:\/\//i.test(trimmedUrl)) {
      toast.error("URL must start with http:// or https://");
      return;
    }

    setValue("socialLinks", {
      ...formData.socialLinks,
      [selectedPlatform]: trimmedUrl,
    });

    resetSocialForm();
    setSocialDialogOpen(false);
    toast.success("Social link added!");
  };

  const deleteSocial = () => {
    if (!selectedPlatform) return;

    const newSocialLinks = { ...formData.socialLinks };
    delete newSocialLinks[selectedPlatform];
    setValue("socialLinks", newSocialLinks);

    resetSocialForm();
    setSocialDialogOpen(false);
    toast.success("Social link removed!");
  };

  const resetSocialForm = () => {
    setSelectedPlatform("");
    setUrlValue("");
    setSearch("");
  };

  const handleSocialEdit = (platform: string) => {
    setSelectedPlatform(platform);
    setUrlValue(String(formData.socialLinks?.[platform] || ""));
    setSocialDialogOpen(true);
  };

  const SocialIcon = ({ name }: { name: string }) => {
    const Icon = socialIcons[name];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  return (
    <div className="space-y-6">
      {/* URL Management Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4 bg-muted/30 rounded-lg p-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <span>My Lynkid:</span>
                <div className="flex items-center gap-1">
                  {(pendingProfile.isPublic ?? profile?.isPublic) ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-orange-600" />
                  )}
                  <span className={(pendingProfile.isPublic ?? profile?.isPublic) ? "text-green-600" : "text-orange-600"}>
                    {(pendingProfile.isPublic ?? profile?.isPublic) ? "Public" : "Private"}
                  </span>
                </div>
              </div>
              <div className="font-mono text-sm truncate">
                {currentUrl}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                {copySuccess ? "Copied!" : "Share"}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setNewUsername(profile?.username || "");
                  setConfirmationText("");
                  setUsernameError("");
                  setUsernameAvailable(null);
                  setUsernameDialogOpen(true);
                }}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Customize URL
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="isPublic" className="text-sm font-medium">
                Public Profile
              </Label>
              <Switch
                id="isPublic"
                checked={pendingProfile.isPublic ?? profile?.isPublic ?? true}
                onCheckedChange={handlePublicToggle}
              />
            </div>
          </div>
        </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <Image
              src={profile?.avatar || "/placeholder.svg"}
              alt={formData.displayName || profile?.username}
              fill
            />
            <AvatarFallback>
              {(formData.displayName || profile?.username || "")
                .charAt(0)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                {...form.register("displayName")}
                className="text-xl font-semibold"
                placeholder="Your display name"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                {...form.register("bio")}
                placeholder="Tell people about yourself"
                className="text-muted-foreground"
              />
            </div>

            <div className="flex items-center gap-2">
              {Object.keys(formData.socialLinks || {}).map((platform) => (
                <Button
                  key={platform}
                  variant="ghost"
                  size="sm"
                  className="p-2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleSocialEdit(platform)}
                >
                  <SocialIcon name={platform} />
                </Button>
              ))}

              <Dialog
                open={socialDialogOpen}
                onOpenChange={setSocialDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={resetSocialForm}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedPlatform
                        ? "Edit Social Link"
                        : "Add Social Link"}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    {!selectedPlatform ? (
                      <div className="space-y-3">
                        <Input
                          placeholder="Search platforms..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="max-h-60 overflow-y-auto space-y-1">
                          {filteredPlatforms.map((platform) => {
                            const hasLink =
                              !!formData.socialLinks?.[platform.id];
                            return (
                              <Button
                                key={platform.id}
                                variant="ghost"
                                className="w-full justify-between h-10"
                                onClick={() => {
                                  setSelectedPlatform(platform.id);
                                  setUrlValue(
                                    String(
                                      formData.socialLinks?.[platform.id] || ""
                                    )
                                  );
                                }}
                              >
                                <span>{platform.label}</span>
                                {hasLink ? (
                                  <span className="text-primary">✓</span>
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
                        <div className="text-sm font-medium">
                          {
                            socialPlatforms.find(
                              (p) => p.id === selectedPlatform
                            )?.label
                          }
                        </div>
                        <Input
                          placeholder="https://example.com/yourprofile"
                          value={urlValue}
                          onChange={(e) => setUrlValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addSocial();
                          }}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={resetSocialForm}>
                            Back
                          </Button>
                          <Button onClick={addSocial}>Save</Button>
                          {formData.socialLinks?.[selectedPlatform] ? (
                            <Button
                              variant="destructive"
                              onClick={deleteSocial}
                            >
                              Delete
                            </Button>
                          ) : null}
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

    {/* Username Customization Dialog */}
    <Dialog open={usernameDialogOpen} onOpenChange={setUsernameDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Your URL</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground flex-shrink-0">
                {typeof window !== 'undefined' ? window.location.origin : 'localhost:3000'}/
              </span>
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => {
                  setNewUsername(e.target.value);
                }}
                placeholder="your-username"
                className="flex-1"
                autoFocus
              />
            </div>
            <div className="mt-1 min-h-[20px]">
              {isCheckingUsername && (
                <p className="text-sm text-muted-foreground">Checking availability...</p>
              )}
              {usernameError && (
                <p className="text-sm text-destructive">{usernameError}</p>
              )}
              {usernameAvailable === true && newUsername.trim() !== profile?.username && (
                <p className="text-sm text-green-600">✓ Username is available</p>
              )}
            </div>
          </div>
          
          {/* Confirmation Field */}
          {usernameAvailable && newUsername.trim() !== profile?.username && (
            <div>
              <Label htmlFor="confirmation">Type &quot;YAKIN&quot; to confirm</Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="YAKIN"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                This action will change your profile URL permanently.
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setUsernameDialogOpen(false);
                setNewUsername("");
                setConfirmationText("");
                setUsernameError("");
                setUsernameAvailable(null);
              }}
              disabled={isUpdatingUsername}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUsernameSubmit}
              disabled={
                isUpdatingUsername ||
                !usernameAvailable ||
                confirmationText !== "YAKIN" ||
                newUsername.trim() === profile?.username
              }
            >
              {isUpdatingUsername ? "Updating..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
);
}

// Design Section Component
function DesignSection({
  profile,
  pendingProfile,
  onUpdate,
}: {
  profile: ProfileData;
  pendingProfile: Partial<ProfileData>;
  onUpdate: (updates: Partial<ProfileData>) => void;
}) {
  // Use pending changes first, then fallback to profile, then defaults
  const layoutVariant = pendingProfile?.layoutVariant ?? profile?.layoutVariant ?? "default";
  const schemeVariant = pendingProfile?.schemeVariant ?? profile?.schemeVariant ?? "theme1";
  const buttonVariant = pendingProfile?.buttonVariant ?? profile?.buttonVariant ?? "default";

  const handleLayoutChange = (value: "default" | "store") => {
    onUpdate({ layoutVariant: value });
  };

  const handleThemeChange = (value: "theme1" | "theme2") => {
    onUpdate({ schemeVariant: value });
  };

  const handleButtonVariantChange = (value: ButtonVariant) => {
    onUpdate({ buttonVariant: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Design Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <LayoutSelector
            value={layoutVariant}
            onValueChange={handleLayoutChange}
          />
          
          <ThemeSelector
            value={schemeVariant}
            onValueChange={handleThemeChange}
          />
          
          <ButtonVariantSelector
            value={buttonVariant}
            onValueChange={handleButtonVariantChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Link Card Component
function LinkCard({
  link,
  onUpdate,
  onDelete,
}: {
  link: LinkData;
  onUpdate: (updates: Partial<LinkData>) => void;
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
  };

  const form = useForm({
    resolver: zodResolver(LinkSchema),
    defaultValues: {
      title: link.title || "",
      url: link.url || "",
    },
  });

  const { watch } = form;
  const formData = watch();

  // Track initial values to prevent unnecessary updates
  const initialValuesRef = useRef({ title: "", url: "" });

  // Reset form when link data changes
  useEffect(() => {
    const newValues = {
      title: link.title || "",
      url: link.url || "",
    };

    form.reset(newValues);
    initialValuesRef.current = newValues;
  }, [link.title, link.url, form]);

  // Only update when values actually change from initial values
  useEffect(() => {
    const current = {
      title: formData.title,
      url: formData.url,
    };

    const initial = initialValuesRef.current;

    // Check if values have actually changed from initial values
    const hasChanged =
      current.title !== initial.title || current.url !== initial.url;

    if (hasChanged && (current.title || current.url)) {
      onUpdate(current);
    }
  }, [formData.title, formData.url, onUpdate]);

  const handleDelete = () => {
    if (confirm("Delete this link?")) {
      onDelete();
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 transition-opacity ${isDragging ? "opacity-50" : ""} ${
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
            <Input
              {...form.register("title")}
              placeholder="Link title"
              className="font-medium border-0 px-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
            <Switch
              checked={link.isActive}
              aria-label="Active"
              id="active"
              onCheckedChange={(checked) => onUpdate({ isActive: checked })}
            />
          </div>

          <Input
            {...form.register("url")}
            placeholder="https://example.com"
            className="text-sm text-muted-foreground border-0 px-0 shadow-none focus-visible:ring-0 bg-transparent"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">0 clicks</span>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Add Link Dialog Component
function AddLinkDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: { title: string; url: string }) => void;
}) {
  const form = useForm({
    resolver: zodResolver(LinkSchema),
    defaultValues: { title: "", url: "" },
  });

  const handleSubmit = (data: { title: string; url: string }) => {
    onAdd(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Link</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Link title"
              autoFocus
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              {...form.register("url")}
              placeholder="https://example.com"
            />
            {form.formState.errors.url && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.url.message}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Add Link
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Preview Component
function Preview({
  profile,
  links,
}: {
  profile: ProfileData;
  links: LinkData[];
}) {
  const socialIcons: SocialIconMap = {
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

  const activeLinks = links
    .filter((link) => link.isActive)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // Get design settings with defaults
  const layoutVariant = profile?.layoutVariant || "default";
  const schemeVariant = profile?.schemeVariant || "theme1";
  const buttonVariant = profile?.buttonVariant || "default";

  // Theme classes based on schemeVariant
  const themeClasses = schemeVariant === "theme1" 
    ? "bg-white text-black font-mono" 
    : "bg-white text-blue-900 font-sans";

  // Layout classes based on layoutVariant
  const isStoreLayout = layoutVariant === "store";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-64 h-[500px] border-4 border-foreground rounded-[2.5rem] p-2 mx-auto">
          <div className={`w-full h-full rounded-[2rem] overflow-hidden ${themeClasses}`}>
            <div className="pt-10 px-6 pb-6 h-full overflow-y-auto">
              <div className="text-center space-y-4">
                <Avatar className="w-20 h-20 mx-auto">
                  <Image
                    src={profile?.avatar || "/placeholder.svg"}
                    alt={profile?.displayName || profile?.username}
                    fill
                  />
                  <AvatarFallback>
                    {(profile?.displayName || profile?.username || "")
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h2 className="text-lg font-semibold text-primary">
                    {profile?.displayName || profile?.username}
                  </h2>
                  {profile?.bio && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {profile.bio}
                    </p>
                  )}

                  {profile?.socialLinks &&
                    Object.keys(profile.socialLinks).length > 0 && (
                      <div className="flex justify-center gap-2 pt-2">
                        {Object.entries(profile.socialLinks).map(
                          ([platform, url]) => {
                            const Icon = socialIcons[platform];
                            if (!Icon) return null;

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
                                  <Icon className="w-4 h-4" />
                                </a>
                              </Button>
                            );
                          }
                        )}
                      </div>
                    )}
                </div>

                <div className={isStoreLayout ? "grid grid-cols-2 gap-2" : "space-y-3"}>
                  {activeLinks.map((link) => (
                    <Button
                      key={link.id}
                      asChild
                      variant={buttonVariant}
                      className={isStoreLayout 
                        ? "h-16 text-xs flex flex-col p-2" 
                        : "w-full py-3 text-sm font-medium rounded-full border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                      }
                    >
                      <a
                        href={link.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {isStoreLayout ? (
                          <>
                            <span className="font-medium truncate w-full">{link.title || "Untitled"}</span>
                            <span className="text-xs opacity-70">Click here</span>
                          </>
                        ) : (
                          link.title || "Untitled"
                        )}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Layout: <span className="font-medium capitalize">{layoutVariant}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Theme: <span className="font-medium capitalize">{schemeVariant}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Buttons: <span className="font-medium capitalize">{buttonVariant}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Component
export default function MicrositeStudioPage() {
  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // State
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [addLinkDialogOpen, setAddLinkDialogOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({
    profile: {},
    links: {},
    hasChanges: false,
  });
  const [localLinks, setLocalLinks] = useState<LinkData[]>([]);

  // Queries
  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: getProfiles,
  }) as { data: ProfileData[] };

  const { data: serverLinks } = useQuery({
    queryKey: ["links"],
    queryFn: getLinks,
  });

  // Initialize
  useEffect(() => {
    if (profiles.length && !selectedProfileId) {
      setSelectedProfileId(profiles[0].id);
    }
  }, [profiles, selectedProfileId]);

  useEffect(() => {
    if (serverLinks) {
      setLocalLinks(serverLinks as LinkData[]);
    }
  }, [serverLinks]);

  // Current data
  const currentProfile = useMemo(
    () => profiles?.find((p) => p.id === selectedProfileId),
    [profiles, selectedProfileId]
  );

  const currentLinks = useMemo(
    () =>
      selectedProfileId
        ? localLinks.filter((link) => link.profileId === selectedProfileId)
        : [],
    [localLinks, selectedProfileId]
  );

  const orderedLinks = useMemo(
    () =>
      [...currentLinks].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    [currentLinks]
  );

  // Mutations
  const updateProfileMutation = useMutation<ProfileData, Error, ProfileUpdateInput>({
    mutationFn: async (payload: ProfileUpdateInput) => updateProfile(payload) as Promise<ProfileData>,
    onSuccess: (updatedProfile: ProfileData) => {
      // Immediately update the profiles query data to prevent UI reversion
      queryClient.setQueryData(["profiles"], (oldProfiles: ProfileData[] | undefined) => {
        if (!oldProfiles) return oldProfiles;
        return oldProfiles.map(profile => 
          profile.id === updatedProfile.id ? { ...profile, ...updatedProfile } : profile
        );
      });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  const updateLinkMutation = useMutation<LinkData, Error, LinkUpdateInput>({
    mutationFn: async (payload: LinkUpdateInput) => updateLink(payload) as Promise<LinkData>,
    onSuccess: (updatedLink: LinkData) => {
      // Immediately update the links query data
      queryClient.setQueryData(["links"], (oldLinks: LinkData[] | undefined) => {
        if (!oldLinks) return oldLinks;
        return oldLinks.map(link => 
          link.id === updatedLink.id ? { ...link, ...updatedLink } : link
        );
      });
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });

  const createLinkMutation = useMutation<LinkData, Error, LinkCreateInput>({
    mutationFn: async (payload: LinkCreateInput) => createLink(payload) as Promise<LinkData>,
    onSuccess: (createdLink: LinkData) => {
      // Immediately update the links query data
      queryClient.setQueryData(["links"], (oldLinks: LinkData[] | undefined) => {
        return [...(oldLinks || []), createdLink];
      });
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });

  const deleteLinkMutation = useMutation<void, Error, string>({
    mutationFn: async (id: string) => deleteLink(id) as Promise<void>,
    onSuccess: (_, deletedId) => {
      // Immediately update the links query data
      queryClient.setQueryData(["links"], (oldLinks: LinkData[] | undefined) => {
        if (!oldLinks) return oldLinks;
        return oldLinks.filter(link => link.id !== deletedId);
      });
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });

  // Handlers
  const handleProfileUpdate = useCallback((updates: Partial<ProfileData>) => {
    setPendingChanges((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...updates },
      hasChanges: true,
    }));
  }, []);

  const handleUsernameUpdate = useCallback(async (newUsername: string): Promise<boolean> => {
    if (!currentProfile) return false;

    try {
      const payload = {
        id: currentProfile.id,
        username: newUsername.trim(),
        displayName: currentProfile.displayName,
        bio: currentProfile.bio,
        avatar: currentProfile.avatar,
        isPublic: currentProfile.isPublic,
        socialLinks: currentProfile.socialLinks,
        layoutVariant: currentProfile.layoutVariant ?? "default",
        schemeVariant: currentProfile.schemeVariant ?? "theme1",
        buttonVariant: currentProfile.buttonVariant ?? "default",
      };

      await updateProfileMutation.mutateAsync(payload);
      toast.success("Username updated successfully!");
      return true;
    } catch (error) {
      console.error("Error updating username:", error);
      toast.error("Failed to update username");
      return false;
    }
  }, [currentProfile, updateProfileMutation]);

  const handleLinkUpdate = useCallback(
    (linkId: string, updates: Partial<LinkData>) => {
      // Update local state immediately
      setLocalLinks((prev) =>
        prev.map((link) =>
          link.id === linkId ? { ...link, ...updates } : link
        )
      );

      // Track pending changes
      setPendingChanges((prev) => ({
        ...prev,
        links: {
          ...prev.links,
          [linkId]: { ...prev.links[linkId], ...updates },
        },
        hasChanges: true,
      }));
    },
    []
  );

  const handleLinkDelete = (linkId: string) => {
    setLocalLinks((prev) => prev.filter((link) => link.id !== linkId));
    deleteLinkMutation.mutate(linkId);

    // Remove from pending changes
    setPendingChanges((prev) => {
      const newLinks = { ...prev.links };
      delete newLinks[linkId];
      return {
        ...prev,
        links: newLinks,
      };
    });

    toast.success("Link deleted");
  };

  const handleAddLink = (data: { title: string; url: string }) => {
    if (!selectedProfileId) return;

    const tempId = `temp-${Date.now()}`;
    const newLink: LinkData = {
      id: tempId,
      profileId: selectedProfileId,
      title: data.title,
      url: data.url,
      isActive: true,
      sortOrder: currentLinks.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to local state immediately
    setLocalLinks((prev) => [...prev, newLink]);

    // Create on server
    const payload: LinkCreateInput = {
      profileId: selectedProfileId,
      title: data.title,
      url: data.url,
      sortOrder: currentLinks.length,
      isActive: true,
    };

    createLinkMutation.mutate(payload, {
      onSuccess: (createdLink) => {
        // Replace temp link with real one
        setLocalLinks((prev) =>
          prev.map((link) =>
            link.id === tempId ? (createdLink as LinkData) : link
          )
        );
        toast.success("Link added");
      },
      onError: () => {
        // Remove temp link on error
        setLocalLinks((prev) => prev.filter((link) => link.id !== tempId));
        toast.error("Failed to add link");
      },
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedLinks.findIndex((link) => link.id === active.id);
    const newIndex = orderedLinks.findIndex((link) => link.id === over.id);
    const newOrder = arrayMove(orderedLinks, oldIndex, newIndex);

    // Update local state immediately
    newOrder.forEach((link, index) => {
      handleLinkUpdate(link.id, { sortOrder: index });
    });
  };

  const handleSaveAll = async () => {
    try {
      const promises: Promise<unknown>[] = [];

      // Save profile changes
      if (Object.keys(pendingChanges.profile).length > 0 && currentProfile) {
        // Filter social links to only include supported platforms and valid URLs
        const socialLinks =
          pendingChanges.profile.socialLinks ?? currentProfile.socialLinks;
        const validSocialLinks: Record<string, string> = {};

        if (socialLinks) {
          const supportedPlatforms = [
            "instagram",
            "tiktok",
            "youtube",
            "twitter",
            "linkedin",
            "facebook",
            "telegram",
            "whatsapp",
            "email",
            "github",
          ];

          Object.entries(socialLinks).forEach(([platform, url]) => {
            if (supportedPlatforms.includes(platform) && url && url.trim()) {
              validSocialLinks[platform] = url.trim();
            }
          });
        }

        // Helper function to clean URL values
        const cleanUrl = (
          url: string | undefined | null
        ): string | undefined => {
          if (!url || url.trim() === "") return undefined;
          const trimmed = url.trim();
          // Basic URL validation
          try {
            new URL(trimmed);
            return trimmed;
          } catch {
            return undefined;
          }
        };

        const profilePayload: ProfileUpdateInput = {
          id: currentProfile.id,
          username: currentProfile.username,
          displayName:
            (pendingChanges.profile.displayName ??
              currentProfile.displayName) ||
            currentProfile.username,
          bio: pendingChanges.profile.bio ?? currentProfile.bio,
          avatar: cleanUrl(currentProfile.avatar),
          isPublic: pendingChanges.profile.isPublic ?? currentProfile.isPublic,
          socialLinks:
            Object.keys(validSocialLinks).length > 0
              ? validSocialLinks
              : undefined,
          // Include design variant fields
          layoutVariant: pendingChanges.profile.layoutVariant ?? currentProfile.layoutVariant ?? "default",
          schemeVariant: pendingChanges.profile.schemeVariant ?? currentProfile.schemeVariant ?? "theme1",
          buttonVariant: pendingChanges.profile.buttonVariant ?? currentProfile.buttonVariant ?? "default",
        };
        promises.push(updateProfileMutation.mutateAsync(profilePayload));
      }

      // Save link changes
      Object.entries(pendingChanges.links).forEach(([linkId, updates]) => {
        const link = currentLinks.find((l) => l.id === linkId);
        if (link) {
          const linkPayload: LinkUpdateInput = {
            id: linkId,
            profileId: link.profileId,
            title: updates.title ?? link.title,
            url: updates.url ?? link.url,
            isActive: updates.isActive ?? link.isActive,
            sortOrder: updates.sortOrder ?? link.sortOrder,
          };
          promises.push(updateLinkMutation.mutateAsync(linkPayload));
        }
      });

      await Promise.all(promises);

      // Wait a brief moment to ensure query data has been updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Clear pending changes only after all updates are complete
      setPendingChanges({
        profile: {},
        links: {},
        hasChanges: false,
      });

      toast.success("All changes saved!");
    } catch (error) {
      console.error("Failed to save changes:", error);

      // Extract more specific error message
      let errorMessage = "Failed to save some changes";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const response = (error as ApiErrorResponse).response;
        if (response?.data?.error) {
          errorMessage = response.data.error;
        } else if (response?.status === 400) {
          errorMessage = "Validation error: Please check your input data";
        }
      }

      toast.error(errorMessage);
    }
  };

  if (!currentProfile) {
    return <div className="p-6">Loading...</div>;
  }

  const publicUrl = `http://localhost:3000/${currentProfile.username}`;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Microsite Studio</h1>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            {publicUrl}
          </a>
        </div>

        <Button
          onClick={handleSaveAll}
          disabled={!pendingChanges.hasChanges}
          className="min-w-[140px]"
        >
          <Save className="w-4 h-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileSection
            profile={currentProfile}
            pendingProfile={pendingChanges.profile}
            onUpdate={handleProfileUpdate}
            onUsernameUpdate={handleUsernameUpdate}
          />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Links</CardTitle>
              <Button
                onClick={() => setAddLinkDialogOpen(true)}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={orderedLinks.map((link) => link.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {orderedLinks.map((link) => (
                      <LinkCard
                        key={link.id}
                        link={link}
                        onUpdate={(updates) =>
                          handleLinkUpdate(link.id, updates)
                        }
                        onDelete={() => handleLinkDelete(link.id)}
                      />
                    ))}
                    {orderedLinks.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No links yet. Add your first link to get started!</p>
                        <Button
                          onClick={() => setAddLinkDialogOpen(true)}
                          variant="outline"
                          className="mt-4"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Link
                        </Button>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>

          <DesignSection
            profile={currentProfile}
            pendingProfile={pendingChanges.profile}
            onUpdate={handleProfileUpdate}
          />
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <Preview
              profile={{
                ...currentProfile,
                ...pendingChanges.profile,
                displayName:
                  pendingChanges.profile.displayName ??
                  currentProfile.displayName,
                bio: pendingChanges.profile.bio ?? currentProfile.bio,
                isPublic:
                  pendingChanges.profile.isPublic ??
                  currentProfile.isPublic,
                socialLinks:
                  pendingChanges.profile.socialLinks ??
                  currentProfile.socialLinks,
                layoutVariant:
                  pendingChanges.profile.layoutVariant ??
                  currentProfile.layoutVariant ??
                  "default",
                schemeVariant:
                  pendingChanges.profile.schemeVariant ??
                  currentProfile.schemeVariant ??
                  "theme1",
                buttonVariant:
                  pendingChanges.profile.buttonVariant ??
                  currentProfile.buttonVariant ??
                  "default",
              }}
              links={orderedLinks}
            />
          </div>
        </div>
      </div>

      {/* Add Link Dialog */}
      <AddLinkDialog
        open={addLinkDialogOpen}
        onOpenChange={setAddLinkDialogOpen}
        onAdd={handleAddLink}
      />

      {/* Pending Changes Indicator */}
      {pendingChanges.hasChanges && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card border rounded-lg shadow-lg p-4 flex items-center gap-3 z-50">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">You have unsaved changes</span>
          <Button size="sm" onClick={handleSaveAll}>
            <Save className="w-4 h-4 mr-2" />
            Save Now
          </Button>
        </div>
      )}
    </div>
  );
}
