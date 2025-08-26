// src/app/(main)/admin/users/page.tsx
"use client";

import { useState } from "react";
import UsersTable from "@/components/admin/UsersTable";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import CreateUserDialog from "@/components/admin/CreateUserDialog";

export default function AdminUsersPage() {
  // State to manage the create user dialog visibility
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              View and manage all users on the platform.
            </p>
          </div>
          <Button onClick={() => setIsCreateUserDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </div>
        <div>
          <UsersTable />
        </div>
      </div>

      <CreateUserDialog
        isOpen={isCreateUserDialogOpen}
        onOpenChange={setIsCreateUserDialogOpen}
      />
    </>
  );
}
