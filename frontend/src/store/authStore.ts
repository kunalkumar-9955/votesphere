import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  name: string;
  email: string;
  role: "super_admin" | "org_admin" | "voter";
  is_verified: boolean;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isSuperAdmin: () => boolean;
  isOrgAdmin: () => boolean;
}

function setCookie(name: string, value: string, maxAge: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) => {
        // localStorage
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        // Cookie — middleware ke liye (1 hour)
        setCookie("access_token", accessToken, 3600);
        set({ user, accessToken, refreshToken });
      },

      logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        // Cookie clear
        clearCookie("access_token");
        set({ user: null, accessToken: null, refreshToken: null });
      },

      isAuthenticated: () => !!get().accessToken,
      isSuperAdmin: () => get().user?.role === "super_admin",
      isOrgAdmin: () => ["super_admin", "org_admin"].includes(get().user?.role || ""),
    }),
    {
      name: "votesphere-auth",
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
      }),
      // Rehydrate hone ke baad cookie bhi sync karo
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          setCookie("access_token", state.accessToken, 3600);
        }
      },
    }
  )
);
