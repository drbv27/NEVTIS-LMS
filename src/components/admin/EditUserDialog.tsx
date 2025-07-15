// src/components/admin/EditUserDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { type Profile } from "@/lib/types";
import { useAdminUserMutations } from "@/hooks/useAdminUserMutations";
import { useCourseList } from "@/hooks/useCourseList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface EditUserDialogProps {
  user: Profile;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditUserDialog({
  user,
  isOpen,
  onOpenChange,
}: EditUserDialogProps) {
  const { updateUser, isUpdatingUser, enrollUser, isEnrollingUser } =
    useAdminUserMutations();
  const { data: courses, isLoading: isLoadingCourses } = useCourseList();

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedRole, setSelectedRole] = useState<Profile["role"]>("student");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setBio(user.bio || "");
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleSaveChanges = () => {
    if (!fullName.trim()) {
      alert("Full name cannot be empty.");
      return;
    }
    updateUser(
      {
        userId: user.id,
        role: selectedRole,
        full_name: fullName,
        bio: bio,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleEnroll = () => {
    if (!selectedCourseId) {
      alert("Please select a course to enroll.");
      return;
    }
    enrollUser({
      userId: user.id,
      courseId: selectedCourseId,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit User: {user.full_name}</DialogTitle>
          <DialogDescription>
            Modify the user&apos;s information and permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Biography</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A brief description of the user..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-select">User Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) =>
                setSelectedRole(value as Profile["role"])
              }
            >
              <SelectTrigger id="role-select">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-6" />

          <div>
            <h3 className="text-lg font-medium">Manual Enrollment</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enroll this user in a specific course.
            </p>
            <div className="flex items-center gap-2">
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
                disabled={isLoadingCourses}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleEnroll}
                disabled={!selectedCourseId || isEnrollingUser}
              >
                {isEnrollingUser ? "Enrolling..." : "Enroll"}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSaveChanges} disabled={isUpdatingUser}>
            {isUpdatingUser ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
