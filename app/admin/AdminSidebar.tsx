"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Tags, ShoppingBag, Users, Menu, Store, X } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Users", href: "/admin/users", icon: Users },
];

function NavLinksList({ pathname, onItemClick }: { pathname: string; onItemClick?: () => void }) {
  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onItemClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors font-medium ${
              isActive 
                ? "bg-primary text-white" 
                : "text-gray-600 hover:bg-gray-50 hover:text-primary"
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminSidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (mobile) {
    return (
      <>
        <button onClick={() => setIsOpen(true)} className="p-2 text-gray-600 hover:text-primary">
          <Menu className="w-6 h-6" />
        </button>
        
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-black/50">
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-white p-4 flex flex-col shadow-xl">
              <div className="flex justify-between items-center mb-8 px-2 border-b border-gray-100 pb-4">
                <span className="font-bold text-xl tracking-tight">Stander Admin</span>
                <button onClick={() => setIsOpen(false)} className="p-1 text-gray-400 hover:text-gray-900">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1">
                <NavLinksList pathname={pathname} onItemClick={() => setIsOpen(false)} />
              </div>
              <div className="mt-auto border-t border-gray-100 pt-4">
                <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors">
                  <Store className="w-5 h-5" />
                  <span className="font-medium">Back to Store</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return <NavLinksList pathname={pathname} />;
}
