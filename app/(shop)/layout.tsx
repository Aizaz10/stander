import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  NavbarCategories,
  NavbarCategoriesFallback,
} from "@/components/layout/NavbarCategories";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        categoryLinks={
          <Suspense fallback={<NavbarCategoriesFallback />}>
            <NavbarCategories />
          </Suspense>
        }
      />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
