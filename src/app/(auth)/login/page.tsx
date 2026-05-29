"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword(values);
    if (authError) { setError(authError.message); return; }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block font-serif font-bold text-2xl mb-6">
            <span className="text-gold">DxK</span><span className="text-white"> RENTALS</span>
          </Link>
          <h1 className="text-white font-serif font-bold text-3xl mb-2">Welcome Back</h1>
          <p className="text-muted text-sm">Sign in to your account</p>
        </div>
        <div className="bg-surface2 border border-[rgba(212,175,55,0.2)] rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                {error}
              </div>
            )}
            <Button type="submit" loading={isSubmitting} size="lg" className="mt-2 w-full">
              Sign In
            </Button>
          </form>
          <p className="text-center text-muted text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-gold hover:underline">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
