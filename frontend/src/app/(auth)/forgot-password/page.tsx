"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Mail, Lock, ArrowLeft, CheckCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api";

const step1Schema = z.object({
  email: z.string().email("Enter a valid email"),
});

const step2Schema = z.object({
  token: z.string().length(6, "Enter 6-digit code"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
  });

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  });

  const handleStep1 = async (data: Step1Data) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setEmail(data.email);
      setStep(2);
      toast.success("Reset code sent to your email!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (data: Step2Data) => {
    setLoading(true);
    try {
      await authApi.resetPassword(email, data.token, data.password);
      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="glass rounded-3xl p-8 shadow-2xl shadow-black/40">
            {/* Logo */}
            <Link href="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>

            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Reset Password</h1>
              <p className="text-gray-400 text-sm mt-2">
                {step === 1 ? "Enter your email to receive a reset code" : "Enter the code and your new password"}
              </p>
            </div>

            {/* Step 1: Email */}
            {step === 1 && (
              <form onSubmit={form1.handleSubmit(handleStep1)} className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  error={form1.formState.errors.email?.message}
                  {...form1.register("email")}
                />
                <Button type="submit" size="lg" className="w-full" loading={loading}>
                  Send Reset Code
                </Button>
              </form>
            )}

            {/* Step 2: Reset Code + Password */}
            {step === 2 && (
              <motion.form
                onSubmit={form2.handleSubmit(handleStep2)}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <p className="text-sm text-green-400">Code sent to {email}</p>
                </div>

                <Input
                  label="Reset Code"
                  placeholder="000000"
                  maxLength={6}
                  error={form2.formState.errors.token?.message}
                  {...form2.register("token")}
                />

                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  error={form2.formState.errors.password?.message}
                  {...form2.register("password")}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  error={form2.formState.errors.confirmPassword?.message}
                  {...form2.register("confirmPassword")}
                />

                <Button type="submit" size="lg" className="w-full" loading={loading}>
                  Reset Password
                </Button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-400 hover:text-white transition-colors w-full text-center"
                >
                  Use different email
                </button>
              </motion.form>
            )}

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-xs text-gray-500">
                Remember your password?{" "}
                <Link href="/login" className="text-primary-400 hover:text-primary-300 transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
