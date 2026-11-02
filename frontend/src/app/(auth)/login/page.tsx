"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Fingerprint, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

const DEMO_CREDS = [
  { role: "Super Admin", email: "admin@votesphere.com", password: "Admin@123", color: "from-purple-500 to-pink-500" },
  { role: "Org Admin",   email: "rajesh@college.edu",   password: "Admin@123", color: "from-blue-500 to-cyan-500" },
  { role: "Voter",       email: "student1@college.edu", password: "Voter@123", color: "from-green-500 to-emerald-500" },
];

// Google SVG icon
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  // Already logged in → dashboard
  useEffect(() => {
    const token = useAuthStore.getState().accessToken;
    const user  = useAuthStore.getState().user;
    if (token && user) {
      router.replace(
        user.role === "super_admin" ? "/dashboard/admin" :
        user.role === "org_admin"   ? "/dashboard/org"   : "/dashboard/voter"
      );
    }
  }, [router]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // ── Email/Password login ──────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      const { access_token, refresh_token, user } = res.data;
      setAuth(user, access_token, refresh_token);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      await new Promise((r) => setTimeout(r, 80));
      router.replace(
        user.role === "super_admin" ? "/dashboard/admin" :
        user.role === "org_admin"   ? "/dashboard/org"   : "/dashboard/voter"
      );
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // ── Google Sign-In ────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      // Dynamic import — SSR safe
      const { getAuth, GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const { default: app } = await import("@/lib/firebase");

      const auth     = getAuth(app);
      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");

      const result   = await signInWithPopup(auth, provider);
      const idToken  = await result.user.getIdToken();

      // Backend ko token bhejo → JWT lo
      const res = await authApi.googleLogin(idToken);
      const { access_token, refresh_token, user } = res.data;

      setAuth(user, access_token, refresh_token);
      toast.success(`Welcome, ${user.name.split(" ")[0]}! 🎉`);
      await new Promise((r) => setTimeout(r, 80));

      router.replace(
        user.role === "super_admin" ? "/dashboard/admin" :
        user.role === "org_admin"   ? "/dashboard/org"   : "/dashboard/voter"
      );
    } catch (err: any) {
      // User ne popup band kiya
      if (err?.code === "auth/popup-closed-by-user" || err?.code === "auth/cancelled-popup-request") {
        toast("Sign-in cancelled", { icon: "ℹ️" });
      } else {
        toast.error(err?.message || "Google sign-in failed");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const fillDemo = (email: string, password: string) => {
    setValue("email", email);
    setValue("password", password);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="glass rounded-3xl p-8 shadow-2xl shadow-black/40">

            {/* Logo */}
            <div className="text-center mb-7">
              <motion.div whileHover={{ scale: 1.05 }} className="inline-block mb-4">
                <Link href="/" className="inline-flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                    <Fingerprint className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="text-xl font-bold gradient-text block">VoteSphere</span>
                    <span className="text-[10px] font-semibold gradient-text -mt-1 block">Biometric</span>
                  </div>
                </Link>
              </motion.div>
              <h1 className="text-2xl font-bold text-white">Welcome back</h1>
              <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
            </div>

            {/* ── Google Sign-In Button ── */}
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
                bg-white text-gray-800 font-semibold text-sm
                hover:bg-gray-50 active:bg-gray-100
                shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30
                transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mb-5"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              {googleLoading ? "Signing in..." : "Continue with Google"}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-500 font-medium">or sign in with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Email/Password form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" placeholder="you@example.com"
                    className={`w-full rounded-xl bg-white/5 border text-white placeholder-gray-500 px-4 py-3 pl-10 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50
                      ${errors.email ? "border-red-500/50" : "border-white/10 hover:border-white/20 focus:border-primary-500/50"}`}
                    {...register("email")} />
                </div>
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPass ? "text" : "password"} placeholder="••••••••"
                    className={`w-full rounded-xl bg-white/5 border text-white placeholder-gray-500 px-4 py-3 pl-10 pr-10 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50
                      ${errors.password ? "border-red-500/50" : "border-white/10 hover:border-white/20 focus:border-primary-500/50"}`}
                    {...register("password")} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full group" size="lg" loading={loading}>
                Sign In
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                  Create one free
                </Link>
              </p>
              <p className="text-gray-400 text-sm mt-2">
                <Link href="/auth/forgot-password" className="text-primary-400 hover:text-primary-300 transition-colors">
                  Forgot your password?
                </Link>
              </p>
            </div>

            {/* Demo credentials */}
            <div className="mt-5 p-4 rounded-2xl bg-white/3 border border-white/8">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <p className="text-xs text-gray-400 font-medium">Quick Demo Access</p>
              </div>
              <div className="space-y-2">
                {DEMO_CREDS.map((c) => (
                  <motion.button key={c.role} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                    onClick={() => fillDemo(c.email, c.password)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${c.color}`} />
                      <span className="text-xs font-medium text-gray-300">{c.role}</span>
                    </div>
                    <span className="text-xs text-gray-500 group-hover:text-gray-400">{c.email}</span>
                  </motion.button>
                ))}
              </div>
              <p className="text-[10px] text-gray-600 mt-3 text-center">
                Click any row to auto-fill credentials
              </p>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
