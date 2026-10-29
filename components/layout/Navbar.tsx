"use client";

import { useCartStore } from "@/store/cartStore";
import Link from 'next/link';
import { Search, ShoppingCart, User, LogOut, Package, Settings, ChevronDown, Menu, X, HelpCircle, PhoneCall, Truck, PackageSearch } from 'lucide-react';
import { Button } from '../ui/Button';
import { SearchBox } from "./SearchBox";
import { useEffect, useState, useRef, useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";
import { type User as SupabaseUser } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";

const emptySubscribe = () => () => {};

function CartIcon() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <Link
      href="/cart"
      className="relative p-2 text-foreground hover:text-primary transition-colors rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Shopping Cart"
    >
      <ShoppingCart className="h-6 w-6" />
      {mounted && totalItems > 0 && (
        <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </Link>
  );
}

export function Navbar({ categoryLinks }: { categoryLinks?: React.ReactNode } = {}) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close menus on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setUserMenuOpen(false);
  }

  // Auth state listener
  useEffect(() => {
    let mounted = true;
    const supabase = createClient();
    
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      if (user) {
        setUser(user);
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (mounted && data) {
          setRole(data.role);
        }
      }
      setLoading(false);
    }
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        setRole(data?.role || null);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Click outside to close user dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    router.refresh();
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "User";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="whitespace-nowrap text-xl font-bold text-primary sm:text-2xl">
          Stander Trader
        </Link>
        
        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <SearchBox />
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop Track Order Link */}
          <Link
            href="/track-order"
            className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-primary transition-colors px-2.5 py-1.5 rounded-xl hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <PackageSearch className="h-4 w-4 text-primary" />
            <span>Track Order</span>
          </Link>

          {/* Mobile Search Toggle */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="p-2 text-gray-600 hover:text-primary md:hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Toggle search"
          >
            <Search className="h-5 w-5" />
          </button>

          <CartIcon />
          
          {/* User Menu (Desktop & Tablet) */}
          <div className="relative hidden sm:block" ref={dropdownRef}>
            {loading ? (
              <div className="h-9 w-20 bg-gray-100 rounded-lg animate-pulse" />
            ) : !user ? (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-foreground">
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
            ) : (
              <div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center gap-2 text-foreground"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <User className="h-4 w-4" />
                  <span>{firstName}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </Button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <Link 
                      href="/orders" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Package className="h-4 w-4" />
                      My Orders
                    </Link>

                    <Link 
                      href="/track-order" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <PackageSearch className="h-4 w-4" />
                      Track Order
                    </Link>
                    
                    {role === 'admin' && (
                      <Link 
                        href="/admin" 
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}
                    
                    <div className="h-px bg-gray-100 my-2" />
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700 hover:text-primary md:hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 shadow-sm">
          <SearchBox
            autoFocus
            isMobile
            onSelectOrSubmit={() => setMobileSearchOpen(false)}
          />
        </div>
      )}

      {/* Responsive Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-6 shadow-xl animate-fadeIn">
          {/* User Status / Auth Actions on Mobile */}
          <div className="mb-6 pb-6 border-b border-gray-100">
            {loading ? (
              <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            ) : user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold">
                    {firstName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Hello, {firstName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    href="/orders"
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 text-xs font-medium text-gray-700 hover:text-primary hover:bg-gray-100"
                  >
                    <Package className="h-4 w-4 text-primary" />
                    My Orders
                  </Link>
                  {role === 'admin' ? (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-primary-light text-xs font-medium text-primary hover:bg-blue-100"
                    >
                      <Settings className="h-4 w-4" />
                      Admin
                    </Link>
                  ) : null}
                  <button
                    onClick={handleLogout}
                    className="col-span-2 flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          {categoryLinks || (
            <nav className="space-y-1 mb-6 pb-6 border-b border-gray-100 text-sm font-medium">
              <p className="text-xs font-semibold uppercase text-gray-400 px-3 mb-2">Shop Categories</p>
              <Link
                href="/shop"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
              >
                <span>All Products</span>
                <span className="text-xs text-gray-400">→</span>
              </Link>
            </nav>
          )}

          {/* Quick Support Links */}
          <div className="space-y-1 text-sm text-gray-600">
            <p className="text-xs font-semibold uppercase text-gray-400 px-3 mb-2">Help & Support</p>
            <Link
              href="/track-order"
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 hover:text-primary transition-colors text-xs font-medium text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <PackageSearch className="w-4 h-4 text-primary" />
              Track Order
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 hover:text-primary transition-colors text-xs"
            >
              <PhoneCall className="w-4 h-4 text-gray-400" />
              Contact Us
            </Link>
            <Link
              href="/faq"
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 hover:text-primary transition-colors text-xs"
            >
              <HelpCircle className="w-4 h-4 text-gray-400" />
              FAQs
            </Link>
            <Link
              href="/shipping-returns"
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 hover:text-primary transition-colors text-xs"
            >
              <Truck className="w-4 h-4 text-gray-400" />
              Shipping & Delivery
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
