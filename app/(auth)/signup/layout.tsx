import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create an account on Stander to shop electronics and tech gadgets.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
