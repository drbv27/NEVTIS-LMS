// src/components/partner/PartnerCommunitiesTable.tsx
"use client";

import { usePartnerCommunities } from "@/hooks/usePartnerCommunities";
import { type Community } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TableSkeleton from "@/components/shared/TableSkeleton";
import { MoreHorizontal, Library, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Estos props los usaremos para conectar los botones a los diálogos más adelante
interface PartnerCommunitiesTableProps {
  onEdit: (community: Community) => void;
  onDelete: (community: Community) => void;
}

export default function PartnerCommunitiesTable({
  onEdit,
  onDelete,
}: PartnerCommunitiesTableProps) {
  const { data: communities, isLoading, error } = usePartnerCommunities();

  if (isLoading) {
    return <TableSkeleton columns={4} />;
  }

  if (error) {
    return (
      <p className="text-center text-destructive">
        Error loading communities: {error.message}
      </p>
    );
  }

  if (!communities || communities.length === 0) {
    return (
      <div className="mt-8 border-2 border-dashed rounded-lg p-12 text-center">
        <p className="text-muted-foreground">
          You havent created any communities yet.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg mt-8">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Price ID (Stripe)</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {communities.map((community) => (
            <TableRow key={community.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={community.image_url || ""} />
                    <AvatarFallback>
                      <Library className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{community.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <code className="text-sm text-muted-foreground">
                  {community.slug}
                </code>
              </TableCell>
              <TableCell>
                <code className="text-sm text-muted-foreground">
                  {community.stripe_price_id || "Not set"}
                </code>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(community)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(community)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
