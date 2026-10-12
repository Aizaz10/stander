import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { UserFilters, UserFiltersSkeleton } from "@/components/admin/UserFilters";

export const metadata: Metadata = {
  title: "Users Management",
  description: "View registered users and manage permissions.",
};

interface UsersSearchParams {
  q?: string;
  page?: string;
}

async function UsersList({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<UsersSearchParams>;
}) {
  await connection();
  const supabase = await createClient();
  const searchParams = await searchParamsPromise;

  // 1. Verify admin permissions
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  // 2. Build query
  const q = searchParams.q?.trim();
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const limit = 15;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("profiles")
    .select("*, orders(count)", { count: "exact" });

  if (q) {
    query = query.ilike("full_name", `%${q}%`);
  }

  const { data: profiles, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Full Name</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Orders Placed</th>
                <th className="px-6 py-4 font-medium text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {profiles && profiles.length > 0 ? (
                profiles.map((p) => {
                  const ordersCount = p.orders?.[0]?.count ?? 0;
                  const isAdmin = p.role === "admin";

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {p.full_name || "Anonymous User"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {p.phone || "-"}
                      </td>
                      <td className="px-6 py-4">
                        {isAdmin ? (
                          <Badge className="bg-purple-100 text-purple-800 border-none">
                            Admin
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 border-none">
                            Customer
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        {ordersCount} {ordersCount === 1 ? "order" : "orders"}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No users found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {from + 1} to {Math.min(to + 1, count || 0)} of {count} users
          </p>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const params = new URLSearchParams();
              if (q) params.set("q", q);
              params.set("page", pageNum.toString());

              return (
                <Link key={pageNum} href={`/admin/users?${params.toString()}`}>
                  <Button
                    size="sm"
                    variant={pageNum === page ? "primary" : "outline"}
                    className="w-9 h-9 p-0"
                  >
                    {pageNum}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<UsersSearchParams>;
}) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-gray-500 text-sm mt-1">
            Registered customer accounts and administrator profiles.
          </p>
        </div>
        <Suspense fallback={<UserFiltersSkeleton />}>
          <UserFilters />
        </Suspense>
      </div>

      <Suspense fallback={<div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />}>
        <UsersList searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}
