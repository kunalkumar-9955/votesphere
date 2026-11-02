"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Vote, Building2, Users, BarChart3,
  Settings, LogOut, Bell, FileText, PlusCircle, AlertTriangle,
  Fingerprint, Shield, TrendingUp, QrCode
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const adminLinks = [
  { href: "/dashboard/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/admin/organizations", icon: Building2, label: "Organizations" },
  { href: "/dashboard/admin/users", icon: Users, label: "Users" },
  { href: "/dashboard/admin/elections", icon: Vote, label: "Elections" },
  { href: "/dashboard/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/admin/fraud", icon: AlertTriangle, label: "Fraud Reports" },
  { href: "/dashboard/admin/biometric", icon: Fingerprint, label: "Biometric Logs" },
  { href: "/dashboard/admin/logs", icon: FileText, label: "Audit Logs" },
  { href: "/dashboard/admin/settings", icon: Settings, label: "Settings" },
];

const orgLinks = [
  { href: "/dashboard/org", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/org/elections", icon: Vote, label: "Elections" },
  { href: "/dashboard/org/elections/create", icon: PlusCircle, label: "Create Election" },
  { href: "/dashboard/org/members", icon: Users, label: "Members" },
  { href: "/dashboard/org/reports", icon: FileText, label: "Reports" },
  { href: "/dashboard/org/notifications", icon: Bell, label: "Notifications" },
  { href: "/dashboard/org/settings", icon: Settings, label: "Settings" },
];

const voterLinks = [
  { href: "/dashboard/voter", icon: LayoutDashboard, label: "My Dashboard" },
  { href: "/dashboard/voter/elections", icon: Vote, label: "Active Elections" },
  { href: "/dashboard/voter/history", icon: FileText, label: "Vote History" },
  { href: "/dashboard/voter/devices", icon: Fingerprint, label: "Biometric Devices" },
  { href: "/dashboard/voter/organizations", icon: Building2, label: "My Organizations" },
  { href: "/biometric/enroll", icon: Shield, label: "Enroll Fingerprint" },
];

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  super_admin: { label: "Super Admin", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  org_admin: { label: "Org Admin", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  voter: { label: "Voter", color: "text-green-400 bg-green-500/10 border-green-500/20" },
};

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const links = user?.role === "super_admin" ? adminLinks
    : user?.role === "org_admin" ? orgLinks
    : voterLinks;

  const roleBadge = ROLE_BADGE[user?.role || "voter"];

  // Logo click → apne dashboard pe jaao, landing page pe nahi
  const dashboardHome =
    user?.role === "super_admin" ? "/dashboard/admin" :
    user?.role === "org_admin"   ? "/dashboard/org"   :
                                   "/dashboard/voter";

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-gray-950 border-r border-white/5 flex flex-col">
      {/* Logo — clicks to own dashboard, NOT landing page */}
      <div className="p-5 border-b border-white/5">
        <Link href={dashboardHome} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
            <Fingerprint className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-base font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              VoteSphere
            </span>
            {/* FIXED: "Biometric" text — bright gradient, not dim gray */}
            <p className="text-[10px] font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent -mt-0.5">
              Biometric
            </p>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {user?.name?.[0] || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${roleBadge?.color}`}>
              {roleBadge?.label}
            </span>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== "/dashboard/voter" && pathname.startsWith(link.href) && link.href.length > 20);
          return (
            <Link key={link.href} href={link.href}>
              <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.15 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
                  active
                    ? "bg-gradient-to-r from-primary-500/20 to-accent-500/10 text-white border border-primary-500/20 shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}>
                <link.icon className={cn("w-4 h-4 flex-shrink-0", active && "text-primary-400")} />
                <span className="truncate">{link.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
