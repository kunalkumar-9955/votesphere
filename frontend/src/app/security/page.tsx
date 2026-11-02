"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Shield, Lock, Fingerprint, Brain, Server, Eye, Bell, Users,
  CheckCircle, ArrowRight, GitBranch, Zap, Award, Code, Database
} from "lucide-react";

const securityFeatures = [
  {
    icon: Fingerprint,
    title: "WebAuthn Biometric",
    desc: "Hardware-level security using your device's built-in biometric sensors",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    desc: "All votes encrypted before storage. Cryptographic integrity verified at scale.",
  },
  {
    icon: Shield,
    title: "One Person, One Vote",
    desc: "Cryptographic duplicate prevention with session tracking and device binding.",
  },
  {
    icon: Eye,
    title: "Immutable Audit Trail",
    desc: "Every action logged with IP, timestamp, and cryptographic hash for verification.",
  },
  {
    icon: Brain,
    title: "AI Fraud Detection",
    desc: "Real-time machine learning identifies suspicious patterns and anomalies.",
  },
  {
    icon: Bell,
    title: "Suspicious Login Alerts",
    desc: "Instant notifications if unusual activity detected on your account.",
  },
  {
    icon: Database,
    title: "Vote Anonymity",
    desc: "Optional anonymous voting—voter identity verified but vote untraceable.",
  },
  {
    icon: Server,
    title: "Secure Infrastructure",
    desc: "ISO-grade security standards, regular penetration testing, compliance ready.",
  },
];

const technologies = [
  { name: "JWT Tokens", icon: Lock },
  { name: "bcrypt Hashing", icon: Shield },
  { name: "WebAuthn/FIDO2", icon: Fingerprint },
  { name: "TLS Encryption", icon: Zap },
  { name: "Rate Limiting", icon: GitBranch },
  { name: "SQL Injection Prevention", icon: Code },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm mb-6">
              <Shield className="w-3.5 h-3.5" /> Bank-Grade Security
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              Security You Can Trust
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl">
              VoteSphere uses military-grade encryption, biometric authentication, and AI-powered fraud detection
              to ensure every vote is secure, verified, and tamper-proof.
            </p>
            <Link href="/register">
              <Button size="lg">
                Start Secure Voting <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Security Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 h-full hover:scale-[1.02] transition-transform">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center mb-4">
                    <f.icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Protection */}
      <section className="py-20 px-4 bg-white/3">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Data Protection</h2>
          <div className="space-y-6">
            {[
              {
                title: "Vote Encryption",
                desc: "All votes are encrypted with AES-256 before storage in the database. Only authorized admins can access raw vote data, and even then, only in aggregated form.",
              },
              {
                title: "Biometric Privacy",
                desc: "Your fingerprint never leaves your device. We only store the cryptographic public key generated during enrollment. Biometric data cannot be reconstructed.",
              },
              {
                title: "Session Security",
                desc: "JWT tokens are short-lived (60 min) and refresh tokens rotate automatically. Sessions are invalidated on logout or suspicious activity.",
              },
              {
                title: "GDPR Compliance",
                desc: "Users can export, modify, or delete their data on request. We maintain data minimization principles and secure deletion protocols.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4"
              >
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Technologies</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {technologies.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-4 flex items-center gap-3 hover:border-primary-500/50 transition-colors">
                  <tech.icon className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <span className="font-medium">{tech.name}</span>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white/3">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Security FAQ</h2>
          <div className="space-y-4">
            {[
              { q: "Is my biometric data stored on your servers?", a: "No. Only a cryptographic public key is stored. Your actual fingerprint never leaves your device." },
              { q: "Can votes be traced back to voters?", a: "In anonymous mode, no. Your vote is verified but immediately detached from your identity." },
              { q: "What if I lose my device?", a: "You can enroll a new device and disable the old one from your account settings." },
              { q: "How are elections protected from tampering?", a: "Via cryptographic signatures, audit logs, and immutable vote receipts that voters can verify." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-5 hover:bg-white/5 transition-colors">
                  <h3 className="font-semibold mb-2 text-primary-400">{item.q}</h3>
                  <p className="text-gray-400 text-sm">{item.a}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Vote Securely?</h2>
          <p className="text-gray-400 mb-8">
            Join thousands of organizations using VoteSphere for tamper-proof, transparent elections.
          </p>
          <Link href="/register">
            <Button size="lg">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
