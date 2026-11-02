import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "VoteSphere – Smart Voting & Election Platform",
  description: "All-in-One Secure Voting Platform for Colleges, Clubs, Societies, Corporates and more.",
  keywords: "voting, election, online voting, secure voting, college election",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1f2937",
              color: "#f9fafb",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
            },
          }}
        />
      </body>
    </html>
  );
}
