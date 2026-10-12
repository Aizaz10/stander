import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "View and manage items in your Stander shopping cart.",
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
