"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, LayoutDashboard, Fingerprint } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "super_admin") return "/dashboard/admin";
    if (user.role === "org_admin") return "/dashboard/org";
    return "/dashboard/voter";
  };

  // Logo click: logged in → dashboard, not logged in → home
  const logoHref = isAuthenticated() ? getDashboardPath() : "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo — logged in: dashboard, not logged in: home */}
          <Link href={logoHref} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary-500/30 transition-shadow">
              <Fingerprint className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                VoteSphere
              </span>
              {/* FIXED: bright gradient text, not dim gray */}
              <span className="text-[10px] font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent ml-1 hidden sm:inline">
                Biometric
              </span>
            </div>
          </Link>

          {/* Desktop Nav — only show on public pages */}
          {!isAuthenticated() && (
            <div className="hidden md:flex items-center gap-6">
              <Link href="/features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</Link>
              <Link href="/security" className="text-sm text-gray-400 hover:text-white transition-colors">Security</Link>
              <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link>
            </div>
          )}

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated() ? (
              <>
                <Link href={getDashboardPath()}>
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white">
                    {user?.name?.[0]}
                  </div>
                  <span className="text-sm text-gray-300">{user?.name?.split(" ")[0]}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Login</Button></Link>
                <Link href="/register"><Button size="sm">Get Started</Button></Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-black/40 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-3">
              {isAuthenticated() ? (
                <>
                  <Link href={getDashboardPath()} className="block" onClick={() => setOpen(false)}>
                    <Button className="w-full" size="sm">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="w-full" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" /> Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/features" className="block text-gray-400 hover:text-white py-2" onClick={() => setOpen(false)}>Features</Link>
                  <Link href="/security" className="block text-gray-400 hover:text-white py-2" onClick={() => setOpen(false)}>Security</Link>
                  <Link href="/about" className="block text-gray-400 hover:text-white py-2" onClick={() => setOpen(false)}>About</Link>
                  <Link href="/contact" className="block text-gray-400 hover:text-white py-2" onClick={() => setOpen(false)}>Contact</Link>
                  <Link href="/login" className="block" onClick={() => setOpen(false)}>
                    <Button variant="secondary" className="w-full" size="sm">Login</Button>
                  </Link>
                  <Link href="/register" className="block" onClick={() => setOpen(false)}>
                    <Button className="w-full" size="sm">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
