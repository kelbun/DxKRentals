"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormValues } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (values: SignupFormValues) => {
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.full_name, phone: values.phone },
        emailRedirectTo: `${location.origin}/dashboard`,
      },
    });
    if (authError) { setError(authError.message); return; }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-6">✉️</div>
          <h2 className="text-white font-serif font-bold text-2xl mb-3">Check Your Email</h2>
          <p className="text-muted">
            We&apos;ve sent a confirmation link to your email address. Click it to activate your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block font-serif font-bold text-2xl mb-6">
            <span className="text-gold">DxK</span><span className="text-white"> RENTALS</span>
          </Link>
          <h1 className="text-white font-serif font-bold text-3xl mb-2">Create Account</h1>
          <p className="text-muted text-sm">Join DxK Rentals today</p>
        </div>
        <div className="bg-surface2 border border-[rgba(212,175,55,0.2)] rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Input label="Full Name" placeholder="James Whitmore" error={errors.full_name?.message} {...register("full_name")} />
            <Input label="Email Address" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
            <Input label="Phone (optional)" type="tel" placeholder="+44 7000 000000" {...register("phone")} />
            <Input label="Password" type="password" placeholder="Min. 8 characters" error={errors.password?.message} {...register("password")} />
            <Input label="Confirm Password" type="password" placeholder="Repeat password" error={errors.confirm_password?.message} {...register("confirm_password")} />
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{error}</div>
            )}
            <Button type="submit" loading={isSubmitting} size="lg" className="mt-2 w-full">
              Create Account
            </Button>
          </form>
          <p className="text-center text-muted text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-gold hover:underline">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
