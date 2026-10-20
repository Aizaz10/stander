"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Card } from "@/components/ui/Card";
import { isValidEmail, trimAndCollapse } from "@/lib/validation";
import Link from "next/link";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
  }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const validate = () => {
    const errs: {
      fullName?: string;
      email?: string;
      password?: string;
    } = {};

    const trimmedName = trimAndCollapse(fullName);
    if (!trimmedName || trimmedName.length < 2) {
      errs.fullName = "Full name must be at least 2 characters";
    } else if (trimmedName.length > 60) {
      errs.fullName = "Full name cannot exceed 60 characters";
    }

    if (!email.trim()) {
      errs.email = "Email is required";
    } else if (!isValidEmail(email)) {
      errs.email = "Please enter a valid email address";
    }

    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }

    return errs;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: trimAndCollapse(fullName),
        },
      },
    });

    if (error) {
      setGeneralError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4">
      <Card className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl border-primary-light">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-500">Join Stander to start shopping</p>
        </div>

        {generalError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6" noValidate>
          <div>
            <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <Input 
              id="signup-name"
              type="text" 
              value={fullName} 
              maxLength={60}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
              onBlur={() => {
                const trimmed = trimAndCollapse(fullName);
                if (trimmed && (trimmed.length < 2 || trimmed.length > 60)) {
                  setErrors((prev) => ({
                    ...prev,
                    fullName: "Full name must be between 2 and 60 characters",
                  }));
                }
              }}
              error={errors.fullName}
              placeholder="John Doe"
              required 
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <Input 
              id="signup-email"
              type="email" 
              value={email} 
              maxLength={254}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              onBlur={() => {
                if (email.trim() && !isValidEmail(email)) {
                  setErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }));
                }
              }}
              error={errors.email}
              placeholder="you@example.com"
              required 
            />
          </div>
          
          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <PasswordInput 
              id="signup-password"
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              onBlur={() => {
                if (password && password.length < 6) {
                  setErrors((prev) => ({
                    ...prev,
                    password: "Password must be at least 6 characters",
                  }));
                }
              }}
              error={errors.password}
              hint="Must be at least 6 characters"
              placeholder="••••••••"
              minLength={6}
              required 
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Log in here
          </Link>
        </div>
      </Card>
    </div>
  );
}
