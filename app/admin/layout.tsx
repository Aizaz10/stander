import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Store } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

export const metadata: Metadata = {
  title: {
    template: "%s | Stander Trader Admin",
    default: "Admin Dashboard | Stander Trader Admin",
  },
  description: "Stander Trader e-commerce administration and management.",
  robots: {
    index: false,
    follow: false,
  },
};

function AdminSidebarSkeleton() {
  return (
    <div className="space-y-1 animate-pulse">
      <div className="h-10 bg-gray-100 rounded-xl" />
      <div className="h-10 bg-gray-100 rounded-xl" />
      <div className="h-10 bg-gray-100 rounded-xl" />
      <div className="h-10 bg-gray-100 rounded-xl" />
      <div className="h-10 bg-gray-100 rounded-xl" />
    </div>
  );
}

function AdminSidebarMobileSkeleton() {
  return <div className="w-10 h-10 bg-gray-100 rounded-lg animate-pulse" />;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row print:bg-white print:block">
      {/* Mobile Topbar */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50 print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="font-bold text-lg">Admin</span>
        </div>
        <Suspense fallback={<AdminSidebarMobileSkeleton />}>
          <AdminSidebar mobile />
        </Suspense>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col sticky top-0 h-screen shrink-0 print:hidden">
        <div className="p-6 flex items-center gap-2 border-b border-gray-100">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="font-bold text-xl tracking-tight">Stander Admin</span>
        </div>
        <div className="p-4 flex-1">
          <Suspense fallback={<AdminSidebarSkeleton />}>
            <AdminSidebar />
          </Suspense>
        </div>
        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors">
            <Store className="w-5 h-5" />
            <span className="font-medium">Back to Store</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto print:p-0 print:m-0 print:overflow-visible">
        <div className="max-w-7xl mx-auto print:max-w-none print:m-0 print:p-0 print:w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
