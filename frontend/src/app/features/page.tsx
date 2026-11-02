"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Fingerprint, Brain, Lock, Users, BarChart3, Shield,
  ArrowRight, CheckCircle
} from "lucide-react";

const features = [
  {
    icon: Fingerprint,
    title: "Biometric Security",
    desc: "WebAuthn fingerprint authentication — Touch ID, Windows Hello, Android fingerprint. One-person-one-vote enforced at biometric level.",
    badge: "New"
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    desc: "All votes encrypted with AES-256. Cryptographic vote receipts for verification without revealing voter identity.",
  },
  {
    icon: Brain,
    title: "AI Fraud Detection",
    desc: "Real-time machine learning analyzes voting patterns. Instantly flags suspicious behavior—rapid voting, unusual IPs, shared devices.",
  },
  {
    icon: Users,
    title: "10+ Election Types",
    desc: "College elections, club voting, society polls, corporate decisions, real election simulations, and more.",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    desc: "Real-time dashboards with turnout charts, candidate vote share, risk graphs, and geographic breakdowns.",
  },
  {
    icon: Shield,
    title: "3-Tier Role System",
    desc: "Super Admin oversight, Organization Admin control, and Voter participation—complete audit chain.",
  },
];

const useCases = [
  { title: "College Elections", desc: "Student council, CR, president voting with fingerprint verification" },
  { title: "Corporate Voting", desc: "Board decisions, policy voting with enterprise-grade security" },
  { title: "Club Management", desc: "Treasurer, secretary, president elections verified biometrically" },
  { title: "Society Governance", desc: "Apartment committee elections with identity-verified voting" },
  { title: "Event Decisions", desc: "Polls, contests, and event decisions with real-time results" },
  { title: "NGO Elections", desc: "Community board elections with transparent audit trails" },
];

export default function FeaturesPage() {
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
              <Fingerprint className="w-3.5 h-3.5" /> Features
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              Enterprise-Grade Voting Platform
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl">
              Biometric security, AI fraud detection, and real-time analytics for elections
              that are tamper-proof, transparent, and trusted by thousands.
            </p>
            <Link href="/register">
              <Button size="lg">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Powerful Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 h-full hover:scale-[1.02] transition-transform relative overflow-hidden">
                  {f.badge && (
                    <span className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
                      {f.badge}
                    </span>
                  )}
                  <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 bg-white/3">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Use Cases</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((useCase, i) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-5 h-full">
                  <div className="flex gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <h3 className="font-semibold">{useCase.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm ml-8">{useCase.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Checklist */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Security Checklist</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "One-person-one-vote enforcement",
              "Biometric duplicate prevention",
              "End-to-end vote encryption",
              "Immutable audit logs",
              "Real-time fraud detection",
              "Anonymous voting option",
              "Cryptographic vote receipts",
              "Device binding & tracking",
              "Session timeout & auto-logout",
              "Role-based access control",
              "Rate limiting & DDoS protection",
              "Regular security audits",
            ].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboards */}
      <section className="py-20 px-4 bg-white/3">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Role-Based Dashboards</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                role: "Super Admin",
                features: [
                  "Platform overview & analytics",
                  "Manage organizations",
                  "Monitor fraud patterns",
                  "Audit logs & compliance",
                  "System settings & security",
                ],
              },
              {
                role: "Organization Admin",
                features: [
                  "Create & manage elections",
                  "Upload voter lists",
                  "Add candidates",
                  "Schedule & control voting",
                  "Export results & reports",
                ],
              },
              {
                role: "Voter",
                features: [
                  "View active elections",
                  "Cast votes biometrically",
                  "Track vote history",
                  "Verify vote receipts",
                  "Manage devices",
                ],
              },
            ].map((dashboard, i) => (
              <motion.div
                key={dashboard.role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4 text-primary-400">{dashboard.role}</h3>
                  <ul className="space-y-2">
                    {dashboard.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-sm text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Elections?</h2>
          <p className="text-gray-400 mb-8">
            Start your free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/security">
              <Button size="lg" variant="outline">
                Learn About Security
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
