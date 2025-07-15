//src/app/(main)/profile/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { profile, isLoading, isUpdating, updateProfile } = useProfile();

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    bio: "",
    linkedinUrl: "",
    twitterUrl: "",
    githubUrl: "",
  });

  // Populate the form once the profile data is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || "",
        phoneNumber: profile.phone_number || "",
        bio: profile.bio || "",
        linkedinUrl: profile.social_links?.linkedin || "",
        twitterUrl: profile.social_links?.twitter || "",
        githubUrl: profile.social_links?.github || "",
      });
    }
  }, [profile]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateProfile({
      full_name: formData.fullName,
      phone_number: formData.phoneNumber,
      bio: formData.bio,
      social_links: {
        linkedin: formData.linkedinUrl,
        twitter: formData.twitterUrl,
        github: formData.githubUrl,
      },
      updated_at: new Date().toISOString(),
    });
  };

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Your Profile</CardTitle>
        <CardDescription>
          Update your personal and professional information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ""}
              disabled
              className="bg-gray-100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="min-h-[100px]"
            />
          </div>
          <h3 className="text-lg font-medium border-t pt-6">Social Links</h3>
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              value={formData.linkedinUrl}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitterUrl">Twitter/X URL</Label>
            <Input
              id="twitterUrl"
              name="twitterUrl"
              type="url"
              placeholder="https://x.com/yourusername"
              value={formData.twitterUrl}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="githubUrl">GitHub URL</Label>
            <Input
              id="githubUrl"
              name="githubUrl"
              type="url"
              placeholder="https://github.com/yourusername"
              value={formData.githubUrl}
              onChange={handleInputChange}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
