// src/app/(main)/admin/communities/page.tsx
"use client";

import { useState } from "react";
import CommunitiesTable from "@/components/admin/CommunitiesTable";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import CreateCommunityDialog from "@/components/admin/CreateCommunityDialog";

export default function AdminCommunitiesPage() {
  // State to manage the create community dialog visibility
  const [isCreateCommunityDialogOpen, setIsCreateCommunityDialogOpen] =
    useState(false);

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Community Management</h1>
            <p className="text-muted-foreground">
              Create, edit, and manage all communities on the platform.
            </p>
          </div>
          <Button onClick={() => setIsCreateCommunityDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Community
          </Button>
        </div>
        <div>
          <CommunitiesTable />
        </div>
      </div>

      <CreateCommunityDialog
        isOpen={isCreateCommunityDialogOpen}
        onOpenChange={setIsCreateCommunityDialogOpen}
      />
    </>
  );
}
