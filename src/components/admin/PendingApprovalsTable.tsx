// src/components/admin/PendingApprovalsTable.tsx
"use client";

import { usePendingApprovals } from "@/hooks/usePendingApprovals";
import { useAdminUserMutations } from "@/hooks/useAdminUserMutations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import TableSkeleton from "@/components/shared/TableSkeleton";
import { CheckCircle } from "lucide-react";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PendingApprovalsTable() {
  const { data, isLoading, error } = usePendingApprovals();
  const { approveMembership, isApprovingMembership } = useAdminUserMutations();

  const approvals = data?.approvals;

  if (isLoading) {
    return <TableSkeleton columns={4} rows={3} />;
  }

  if (error) {
    return (
      <p className="text-center text-destructive py-4">
        Error loading pending approvals: {error.message}
      </p>
    );
  }

  // 3. Comprobamos si la lista está vacía.
  if (!approvals || approvals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
        <p>No pending approvals at the moment.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Community</TableHead>
            <TableHead>Request Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* 4. Ahora sí, 'approvals' es un array y podemos usar .map() sin problemas. */}
          {approvals.map((approval) => (
            <TableRow key={approval.id}>
              <TableCell className="font-medium">
                {approval.profiles?.full_name || "N/A"}
              </TableCell>
              <TableCell>{approval.communities?.name || "N/A"}</TableCell>
              <TableCell>{formatDate(approval.created_at)}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                  onClick={() =>
                    approveMembership({ membershipId: approval.id })
                  }
                  disabled={isApprovingMembership}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
