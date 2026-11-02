"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const user = useAuthStore.getState().user;
    if (!user) {
      router.replace("/login");
      return;
    }
    const dest =
      user.role === "super_admin" ? "/dashboard/admin" :
      user.role === "org_admin"   ? "/dashboard/org"   :
                                    "/dashboard/voter";
    router.replace(dest);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}
        className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-xl shadow-primary-500/30">
          <Fingerprint className="w-7 h-7 text-white" />
        </div>
        <p className="text-gray-400 text-sm">Redirecting...</p>
      </motion.div>
    </div>
  );
}
