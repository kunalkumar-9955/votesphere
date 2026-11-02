"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Fingerprint, Mail, Lock, User, Phone, ShieldCheck,
  RefreshCw, CheckCircle2, Eye, EyeOff, Vote, Building2, Users
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

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

// Role options — Super Admin yahan nahi hai (sirf DB se banta hai)
const ROLES = [
  {
    id: "voter",
    icon: Vote,
    title: "Voter",
    desc: "Join elections and cast your vote securely",
    color: "from-green-500 to-emerald-500",
    border: "border-green-500/40",
    bg: "bg-green-500/10",
    badge: null,
  },
  {
    id: "org_admin",
    icon: Building2,
    title: "Organization Admin",
    desc: "Create and manage elections for your organization",
    color: "from-blue-500 to-cyan-500",
    border: "border-blue-500/40",
    bg: "bg-blue-500/10",
    badge: "Requires Approval",
  },
];

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  password: z.string().min(8, "Min 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match", path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

const OTP_RESEND_SECONDS = 60;

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);
  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...digits]; next[i] = v.slice(-1);
    onChange(next.join(""));
    if (v && i < 5) inputs.current[i + 1]?.focus();
  };
  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (p) { onChange(p); inputs.current[Math.min(p.length, 5)]?.focus(); }
    e.preventDefault();
  };
  return (
    <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.input key={i} ref={(el) => { inputs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={digits[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          whileFocus={{ scale: 1.05 }}
          className={`w-11 h-13 text-center text-xl font-bold rounded-xl border transition-all
            bg-white/5 text-white outline-none
            ${digits[i] ? "border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/20" : "border-white/10 hover:border-white/20"}
            focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30`}
        />
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const [step, setStep] = useState<"role" | "register" | "otp">("role");
  const [selectedRole, setSelectedRole] = useState<"voter" | "org_admin">("voter");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuthStore();

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

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // ── Google Sign-Up ────────────────────────────────────────────
  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const { getAuth, GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const { default: app } = await import("@/lib/firebase");
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      provider.addScope("email"); provider.addScope("profile");
      const result  = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      // Google se register hone wale voter bante hain by default
      const res = await authApi.googleLogin(idToken);
      const { access_token, refresh_token, user } = res.data;
      setAuth(user, access_token, refresh_token);
      toast.success(`Welcome, ${user.name.split(" ")[0]}! 🎉`);
      await new Promise((r) => setTimeout(r, 80));
      router.replace("/dashboard/voter");
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") toast("Cancelled", { icon: "ℹ️" });
      else toast.error(err?.message || "Google sign-up failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Email Register ────────────────────────────────────────────
  const onRegister = async (data: FormData) => {
    setLoading(true);
    try {
      await authApi.register({
        name: data.name, email: data.email,
        phone: data.phone, password: data.password,
        role: selectedRole,
      });
      setEmail(data.email);
      setStep("otp");
      setCountdown(OTP_RESEND_SECONDS);
      toast.success("OTP sent to your email!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async () => {
    if (otpValue.length !== 6) { toast.error("Enter all 6 digits"); return; }
    setLoading(true);
    try {
      await authApi.verifyOtp({ email, otp: otpValue });
      toast.success("Email verified! Please sign in.");
      setTimeout(() => router.replace("/login"), 1200);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Invalid OTP");
      setOtpValue("");
    } finally {
      setLoading(false);
    }
  };

  const onResendOtp = async () => {
    if (countdown > 0) return;
    try {
      await authApi.resendOtp(email);
      setCountdown(OTP_RESEND_SECONDS);
      setOtpValue("");
      toast.success("New OTP sent!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to resend");
    }
  };

  const selectedRoleData = ROLES.find((r) => r.id === selectedRole)!;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10">
        <div className="glass rounded-3xl p-8 shadow-2xl shadow-black/40">

          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Fingerprint className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <span className="text-lg font-bold gradient-text block">VoteSphere</span>
                <span className="text-[10px] font-semibold gradient-text -mt-0.5 block">Biometric</span>
              </div>
            </Link>

            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <h1 className="text-xl font-bold text-white">
                  {step === "role" ? "How will you use VoteSphere?" :
                   step === "register" ? "Create your account" : "Verify your email"}
                </h1>
                <p className="text-gray-400 text-xs mt-1">
                  {step === "role" ? "Choose your account type to get started" :
                   step === "register" ? `Registering as ${selectedRoleData.title}` :
                   `OTP sent to ${email}`}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {["role", "register", "otp"].map((s, i) => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-300
                ${step === s ? "w-6 bg-primary-500" :
                  ["role","register","otp"].indexOf(step) > i ? "w-3 bg-primary-500/50" : "w-3 bg-white/10"}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Role Selection ── */}
            {step === "role" && (
              <motion.div key="role" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }} className="space-y-3">

                {ROLES.map((role) => (
                  <motion.button key={role.id} type="button"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRole(role.id as any)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200
                      ${selectedRole === role.id
                        ? `${role.border} ${role.bg} shadow-lg`
                        : "border-white/10 bg-white/3 hover:border-white/20"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0`}>
                        <role.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold text-sm">{role.title}</p>
                          {role.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 font-medium">
                              {role.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs mt-0.5">{role.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                        ${selectedRole === role.id ? `border-current ${role.bg}` : "border-gray-600"}`}
                        style={{ color: selectedRole === role.id ? role.color.split(" ")[1] : undefined }}>
                        {selectedRole === role.id && <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${role.color}`} />}
                      </div>
                    </div>
                  </motion.button>
                ))}

                {/* Super Admin info box */}
                <div className="p-3 rounded-xl bg-white/3 border border-white/8 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-300 font-medium">Super Admin</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Super Admin accounts are created by the platform team only. Contact support if needed.
                    </p>
                  </div>
                </div>

                {/* Google signup */}
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleSignup} disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
                    bg-white text-gray-800 font-semibold text-sm hover:bg-gray-50
                    shadow-lg shadow-black/20 transition-all disabled:opacity-60">
                  {googleLoading
                    ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    : <GoogleIcon />}
                  {googleLoading ? "Signing up..." : "Continue with Google (as Voter)"}
                </motion.button>

                <Button onClick={() => setStep("register")} className="w-full" size="lg">
                  Continue as {selectedRoleData.title} →
                </Button>
              </motion.div>
            )}

            {/* ── STEP 2: Register Form ── */}
            {step === "register" && (
              <motion.form key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit(onRegister)} className="space-y-3.5">

                {/* Selected role badge */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${selectedRoleData.bg} border ${selectedRoleData.border} w-fit`}>
                  <selectedRoleData.icon className="w-3.5 h-3.5" style={{ color: "white" }} />
                  <span className="text-xs font-medium text-white">{selectedRoleData.title}</span>
                  <button type="button" onClick={() => setStep("role")}
                    className="text-gray-400 hover:text-white text-xs ml-1 transition-colors">change</button>
                </div>

                <Input label="Full Name" placeholder="Arjun Sharma" icon={<User className="w-4 h-4" />}
                  error={errors.name?.message} {...register("name")} />
                <Input label="Email Address" type="email" placeholder="you@example.com" icon={<Mail className="w-4 h-4" />}
                  error={errors.email?.message} {...register("email")} />
                <Input label="Phone (optional)" type="tel" placeholder="+91 98765 43210" icon={<Phone className="w-4 h-4" />}
                  {...register("phone")} />

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPass ? "text" : "password"} placeholder="Min 8 characters"
                      className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 px-4 py-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                      {...register("password")} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showConfirm ? "text" : "password"} placeholder="Repeat password"
                      className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 px-4 py-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                      {...register("confirmPassword")} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
                </div>

                {/* Org admin notice */}
                {selectedRole === "org_admin" && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                    <p className="font-medium mb-0.5">Organization Admin Account</p>
                    <p className="text-blue-400/80">Your account will need platform approval before you can create elections. You'll be notified via email.</p>
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  Create Account
                </Button>
              </motion.form>
            )}

            {/* ── STEP 3: OTP Verification ── */}
            {step === "otp" && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="flex justify-center">
                  <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30 flex items-center justify-center">
                    <ShieldCheck className="w-10 h-10 text-primary-400" />
                  </motion.div>
                </div>

                <OtpInput value={otpValue} onChange={setOtpValue} />

                <p className="text-center text-xs text-gray-500">
                  Code expires in <span className="text-primary-400 font-medium">10 minutes</span>
                </p>

                <Button onClick={onVerifyOtp} className="w-full" size="lg" loading={loading}
                  disabled={otpValue.length !== 6}>
                  <CheckCircle2 className="w-4 h-4" /> Verify & Continue
                </Button>

                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend in <span className="text-primary-400 font-semibold tabular-nums">{countdown}s</span>
                    </p>
                  ) : (
                    <button onClick={onResendOtp}
                      className="text-sm text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-1.5 mx-auto">
                      <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
                    </button>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          <div className="mt-5 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
