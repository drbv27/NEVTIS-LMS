// src/app/(main)/admin/users/page.tsx
"use client";

import { useState } from "react";
import UsersTable from "@/components/admin/UsersTable";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import CreateUserDialog from "@/components/admin/CreateUserDialog";
import PendingApprovalsTable from "@/components/admin/PendingApprovalsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore"; // 1. Importar el store
import { Badge } from "@/components/ui/badge"; // 2. Importar el Badge

export default function AdminUsersPage() {
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  // 3. Obtener el contador del store
  const pendingApprovalsCount = useAuthStore(
    (state) => state.pendingApprovalsCount
  );

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage existing users and approve new membership requests.
          </p>
        </div>
        <Button onClick={() => setIsCreateUserDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Users List</TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            Pending Approvals
            {/* 4. Mostrar el badge si el contador es mayor que cero */}
            {pendingApprovalsCount > 0 && (
              <Badge className="px-2">{pendingApprovalsCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UsersTable />
        </TabsContent>
        <TabsContent value="approvals">
          <PendingApprovalsTable />
        </TabsContent>
      </Tabs>

      <CreateUserDialog
        isOpen={isCreateUserDialogOpen}
        onOpenChange={setIsCreateUserDialogOpen}
      />
    </>
  );
}
