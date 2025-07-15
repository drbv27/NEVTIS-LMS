// src/components/dashboard/AdminDashboard.tsx
"use client";

import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Library,
  ShieldCheck,
  Component,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

// A reusable component for our stat cards
const StatCard = ({
  title,
  value,
  icon,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-1/3 mt-1" />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useAdminDashboard();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          An overview of the platform&apos;s status.
        </p>
      </div>

      {error && (
        <p className="text-destructive">Error loading stats: {error.message}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.total_users ?? 0}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Communities"
          value={stats?.total_communities ?? 0}
          icon={<Library className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Courses"
          value={stats?.total_courses ?? 0}
          icon={<Component className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Published Courses"
          value={`${stats?.total_published_courses ?? 0} of ${
            stats?.total_courses ?? 0
          }`}
          icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Links</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/admin/users">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Users</CardTitle>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
            </Card>
          </Link>
          <Link href="/admin/communities">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Communities</CardTitle>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
            </Card>
          </Link>
          <Link href="/admin/courses">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Courses</CardTitle>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
