"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ── Inner component — reads search params (must be wrapped in Suspense) ──────
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") ?? "/dashboard";
  const urlError = searchParams.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "Incorrect email or password. Please try again."
          : error.message
      );
      setIsLoading(false);
      return;
    }

    toast.success("Welcome back!");
    router.push(nextUrl.startsWith("/") ? nextUrl : "/dashboard");
    router.refresh();
  };

  return (
    <Card className="border-border/50 bg-card shadow-2xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-display">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your ClarityOS account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {urlError && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-destructive text-sm">
            {decodeURIComponent(urlError)}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/reset-password"
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-sm">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Join the beta
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page export — wraps form in Suspense ────────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Card className="border-border/50 bg-card shadow-2xl animate-pulse">
          <CardHeader className="space-y-1 pb-4">
            <div className="h-7 w-40 bg-muted rounded" />
            <div className="h-4 w-56 bg-muted rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-10 w-full bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
