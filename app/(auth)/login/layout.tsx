import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Stander account to manage orders and track shipments.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
