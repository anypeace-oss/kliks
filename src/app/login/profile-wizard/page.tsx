"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

export default function ProfileWizard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasProfile, setHasProfile] = useState(false);

  // Check if user already has a profile
  useEffect(() => {
    const checkProfile = async () => {
      if (!session?.user) return;

      try {
        const response = await axios.get("/api/link-in-bio/profiles");
        if (response.data && response.data.length > 0) {
          // User already has a profile, redirect to their profile
          setHasProfile(true);
          router.push(`/${response.data[0].username}`);
        }
      } catch (err) {
        console.error("Error checking profile:", err);
      }
    };

    if (session?.user) {
      checkProfile();
      setDisplayName(session.user.name || "");
      setAvatar(session.user.image || "");
    }
  }, [session, router]);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!isPending && !session && !hasProfile) {
      router.push("/login");
    }
  }, [session, isPending, router, hasProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create profile using the API
      const response = await axios.post("/api/link-in-bio/profiles", {
        username,
        displayName: displayName || username,
        bio,
        avatar,
      });

      if (response.data) {
        // Redirect to the user's new profile
        router.push(`/${username}`);
      }
    } catch (err: unknown) {
      console.error("Error creating profile:", err);
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response && 
        'data' in err.response && 
        typeof err.response.data === 'object' && err.response.data &&
        'error' in err.response.data &&
        typeof err.response.data.error === 'string'
        ? err.response.data.error
        : "Failed to create profile";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || hasProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Create Your Profile
        </h1>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Profile URL</Label>
            <div className="flex items-center mt-1">
              <span className="bg-gray-100 rounded-l-md px-3 py-2 border border-r-0 border-gray-300">
                kreeasi.xyz/
              </span>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                required
                className="rounded-l-none"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              This will be your profile URL: kreeasi.xyz/
              {username || "yourname"}
            </p>
          </div>

          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input
              id="avatar"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
            {avatar && (
              <div className="mt-2">
                <Image
                  src={avatar}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-full object-cover"
                  width={64}
                  height={64}
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !username || !displayName}
            className="w-full"
          >
            {loading ? "Creating Profile..." : "Create Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}
