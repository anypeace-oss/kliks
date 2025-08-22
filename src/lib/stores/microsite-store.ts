import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface ProfileData {
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
  layoutVariant?: "default" | "store";
  schemeVariant?: "theme1" | "theme2";
  buttonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export interface LinkData {
  id: string;
  profileId: string;
  title: string;
  url: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PendingChanges {
  profile: Partial<ProfileData>;
  links: Record<string, Partial<LinkData>>;
  hasChanges: boolean;
}

interface MicrositeStore {
  // State
  selectedProfileId: string;
  profiles: ProfileData[];
  localLinks: LinkData[];
  pendingChanges: PendingChanges;
  addLinkDialogOpen: boolean;

  // Actions
  setSelectedProfileId: (id: string) => void;
  setProfiles: (profiles: ProfileData[]) => void;
  setLocalLinks: (links: LinkData[]) => void;
  updateProfileChanges: (updates: Partial<ProfileData>) => void;
  updateLinkChanges: (linkId: string, updates: Partial<LinkData>) => void;
  removeLinkChanges: (linkId: string) => void;
  clearPendingChanges: () => void;
  setAddLinkDialogOpen: (open: boolean) => void;

  // Helper functions (not getters to avoid circular dependencies)
  getCurrentProfile: () => ProfileData | undefined;
  getCurrentLinks: () => LinkData[];
  getOrderedLinks: () => LinkData[];
}

export const useMicrositeStore = create<MicrositeStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      selectedProfileId: "",
      profiles: [],
      localLinks: [],
      pendingChanges: {
        profile: {},
        links: {},
        hasChanges: false,
      },
      addLinkDialogOpen: false,

      // Actions
      setSelectedProfileId: (id) => set({ selectedProfileId: id }),

      setProfiles: (profiles) => set({ profiles }),

      setLocalLinks: (links) => set({ localLinks: links }),

      updateProfileChanges: (updates) =>
        set((state) => ({
          pendingChanges: {
            ...state.pendingChanges,
            profile: { ...state.pendingChanges.profile, ...updates },
            hasChanges: true,
          },
        })),

      updateLinkChanges: (linkId, updates) =>
        set((state) => {
          // Update local links immediately
          const updatedLocalLinks = state.localLinks.map((link) =>
            link.id === linkId ? { ...link, ...updates } : link
          );

          return {
            localLinks: updatedLocalLinks,
            pendingChanges: {
              ...state.pendingChanges,
              links: {
                ...state.pendingChanges.links,
                [linkId]: { ...state.pendingChanges.links[linkId], ...updates },
              },
              hasChanges: true,
            },
          };
        }),

      removeLinkChanges: (linkId) =>
        set((state) => {
          const newLinks = { ...state.pendingChanges.links };
          delete newLinks[linkId];
          return {
            pendingChanges: {
              ...state.pendingChanges,
              links: newLinks,
            },
          };
        }),

      clearPendingChanges: () =>
        set(() => ({
          pendingChanges: {
            profile: {},
            links: {},
            hasChanges: false,
          },
        })),

      setAddLinkDialogOpen: (open) => set({ addLinkDialogOpen: open }),

      // Helper functions to avoid circular dependencies
      getCurrentProfile: () => {
        const { profiles, selectedProfileId } = get();
        return profiles.find((p) => p.id === selectedProfileId);
      },

      getCurrentLinks: () => {
        const { localLinks, selectedProfileId } = get();
        return selectedProfileId
          ? localLinks.filter((link) => link.profileId === selectedProfileId)
          : [];
      },

      getOrderedLinks: () => {
        const { localLinks, selectedProfileId } = get();
        const currentLinks = selectedProfileId
          ? localLinks.filter((link) => link.profileId === selectedProfileId)
          : [];
        return [...currentLinks].sort(
          (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
        );
      },
    }),
    {
      name: "microsite-store",
    }
  )
);
