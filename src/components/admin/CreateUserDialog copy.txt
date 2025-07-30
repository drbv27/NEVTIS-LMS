// src/components/admin/CreateUserDialog.tsx
"use client";

import { useState } from "react";
import { useAdminUserMutations } from "@/hooks/useAdminUserMutations";
import { type Profile } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateUserDialog({
  isOpen,
  onOpenChange,
}: CreateUserDialogProps) {
  const { createUser, isCreatingUser } = useAdminUserMutations();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<Profile["role"]>("student");

  // Function to reset the form state
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setSelectedRole("student");
  };

  const handleCreateUser = () => {
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      toast.error("Please fill out all required fields.");
      return;
    }

    createUser(
      {
        email,
        password,
        full_name: fullName,
        role: selectedRole,
      },
      {
        onSuccess: () => {
          onOpenChange(false); // Close the dialog
          resetForm(); // Clear the form for next use
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Complete the details to create a new account on the platform. The
            user will receive an email to confirm their account.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Ada Lovelace"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Temporary Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="A secure password"
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
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleCreateUser} disabled={isCreatingUser}>
            {isCreatingUser ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
