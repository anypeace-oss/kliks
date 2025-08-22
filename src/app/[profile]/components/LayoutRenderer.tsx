import { DefaultLayout } from "./DefaultLayout";
import { StoreLayout } from "./StoreLayout";

interface ProfileData {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  backgroundImage?: string;
  isPublic: boolean;
  socialLinks?: Record<string, string>;
  layoutVariant?: string;
  schemeVariant?: string;
  buttonVariant?: string;
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

interface LayoutRendererProps {
  profile: ProfileData;
  links: LinkData[];
}

export function LayoutRenderer({ profile, links }: LayoutRendererProps) {
  // Default to "default" layout if layoutVariant is not set or invalid
  const layoutVariant = profile.layoutVariant || "default";

  switch (layoutVariant) {
    case "store":
      return <StoreLayout profile={profile} links={links} />;
    case "default":
    default:
      return <DefaultLayout profile={profile} links={links} />;
  }
}