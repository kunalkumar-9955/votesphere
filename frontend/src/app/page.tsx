"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import {
  Vote, Shield, BarChart3, Users, Building2, Zap,
  CheckCircle, Star, ChevronDown, Globe, Lock, TrendingUp,
  GraduationCap, Briefcase, Home, Trophy, Heart, School,
  Fingerprint, Cpu, Eye, Key
} from "lucide-react";
import CountUp from "react-countup";
import { useRef } from "react";

const stats = [
  { value: 50000, label: "Votes Cast", suffix: "+" },
  { value: 1200, label: "Elections Held", suffix: "+" },
  { value: 300, label: "Organizations", suffix: "+" },
  { value: 99.9, label: "Uptime", suffix: "%" },
];

const useCases = [
  { icon: GraduationCap, title: "College Elections", desc: "CR, President, Vice President elections with biometric voter verification", color: "from-blue-500 to-cyan-500" },
  { icon: Users, title: "Club Elections", desc: "President, Secretary, Treasurer voting with fingerprint authentication", color: "from-purple-500 to-pink-500" },
  { icon: Home, title: "Society Voting", desc: "Apartment committee elections with secure biometric identity checks", color: "from-green-500 to-emerald-500" },
  { icon: BarChart3, title: "Polling System", desc: "Yes/No and multiple choice polls with verified voter identity", color: "from-orange-500 to-red-500" },
  { icon: Globe, title: "Real Election Simulation", desc: "Constituency-based voting with biometric authentication per voter", color: "from-indigo-500 to-violet-500" },
  { icon: Briefcase, title: "Corporate Voting", desc: "Board decisions and policy voting with enterprise-grade security", color: "from-yellow-500 to-orange-500" },
  { icon: School, title: "School Elections", desc: "Student council elections with age-appropriate biometric verification", color: "from-pink-500 to-rose-500" },
  { icon: Trophy, title: "Contest Voting", desc: "Best performer and talent contest voting with fraud prevention", color: "from-teal-500 to-cyan-500" },
  { icon: Heart, title: "NGO Elections", desc: "Community board elections with transparent biometric audit trail", color: "from-red-500 to-pink-500" },
];

const securityFeatures = [
  { icon: Fingerprint, title: "Fingerprint Authentication", desc: "WebAuthn biometric verification using your device's built-in sensor — Touch ID, Windows Hello, or Android fingerprint" },
  { icon: Shield, title: "One Person One Vote", desc: "Cryptographic duplicate prevention with device binding and session tracking" },
  { icon: Cpu, title: "AI Fraud Detection", desc: "Real-time ML scoring detects suspicious patterns, rapid voting, and anomalous behavior" },
  { icon: Lock, title: "End-to-End Encryption", desc: "Every vote is encrypted before storage. Biometric data never leaves your device" },
  { icon: Eye, title: "Full Audit Trail", desc: "Immutable audit logs for every action — registration, login, vote, and result publication" },
  { icon: Key, title: "JWT + OTP + Biometric", desc: "Triple-layer authentication: password, one-time code, and biometric identity verification" },
];

const testimonials = [
  { name: "Dr. Priya Sharma", role: "Dean, NIT Trichy", text: "VoteSphere Biometric transformed our student elections. The fingerprint verification eliminated all disputes.", rating: 5 },
  { name: "Rahul Mehta", role: "HR Director, TechCorp", text: "The biometric voting system is incredibly secure. Our board elections are now fully tamper-proof.", rating: 5 },
  { name: "Anita Patel", role: "Society Secretary", text: "Finally a platform that handles apartment elections with real identity verification. No more proxy voting.", rating: 5 },
];

const faqs = [
  { q: "How does fingerprint voting work?", a: "Before casting a vote, you verify your identity using your device's built-in biometric sensor (Touch ID, Windows Hello, Android fingerprint). Your biometric data never leaves your device — only a cryptographic key is stored." },
  { q: "What if my device doesn't have a fingerprint sensor?", a: "You can still vote using OTP verification. Biometric authentication is an additional security layer, not a requirement." },
  { q: "Is my fingerprint data stored on your servers?", a: "No. We use the WebAuthn standard — your biometric data stays on your device. We only store a cryptographic public key that cannot be reversed to reconstruct your fingerprint." },
  { q: "Can someone vote twice?", a: "No. Our system enforces one-person-one-vote at multiple levels: session tracking, device binding, and cryptographic vote receipts." },
];

// Animated fingerprint scanner for hero
function HeroScanner() {
  return (
    <div className="relative flex items-center justify-center w-64 h-64 mx-auto">
      {/* Outer rings */}
      {[1, 2, 3].map((i) => (
        <motion.div key={i}
          animate={{ scale: [1, 1 + i * 0.15, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ repeat: Infinity, duration: 3, delay: i * 0.4, ease: "easeInOut" }}
          className="absolute rounded-full border border-primary-500/30"
          style={{ width: `${100 + i * 60}px`, height: `${100 + i * 60}px` }}
        />
      ))}

      {/* Main scanner */}
      <motion.div
        animate={{ boxShadow: ["0 0 30px rgba(99,102,241,0.3)", "0 0 60px rgba(99,102,241,0.6)", "0 0 30px rgba(99,102,241,0.3)"] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-40 h-40 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 border-2 border-primary-500/50 flex items-center justify-center relative overflow-hidden"
      >
        {/* Scan line */}
        <motion.div
          animate={{ y: ["-50%", "50%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent"
        />
        <Fingerprint className="w-20 h-20 text-primary-400" />
      </motion.div>

      {/* Floating badges */}
      <motion.div animate={{ y: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 3 }}
        className="absolute top-4 right-0 glass rounded-xl px-3 py-1.5 text-xs text-green-400 border border-green-500/20 flex items-center gap-1.5">
        <CheckCircle className="w-3 h-3" /> Verified
      </motion.div>
      <motion.div animate={{ y: [4, -4, 4] }} transition={{ repeat: Infinity, duration: 3, delay: 1 }}
        className="absolute bottom-4 left-0 glass rounded-xl px-3 py-1.5 text-xs text-primary-400 border border-primary-500/20 flex items-center gap-1.5">
        <Lock className="w-3 h-3" /> Encrypted
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm mb-6">
                <Fingerprint className="w-4 h-4" />
                Biometric Smart Voting Platform
              </div>

              <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-6">
                <span className="gradient-text">Fingerprint</span>
                <br />
                <span className="text-white">Secure Voting</span>
                <br />
                <span className="text-gray-400 text-4xl">for Every Organization</span>
              </h1>

              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                The world's most secure digital voting platform. Biometric authentication,
                AI fraud detection, and end-to-end encryption — built for governments,
                colleges, and enterprises.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="text-base shadow-xl shadow-primary-500/20">
                    Start Free Today
                    <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
                  </Button>
                </Link>
                <Link href="#security">
                  <Button variant="secondary" size="lg" className="text-base">
                    <Shield className="w-4 h-4" /> Security Features
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-4 mt-8 flex-wrap">
                {["WebAuthn", "FIDO2", "AES-256", "JWT"].map((badge) => (
                  <span key={badge} className="text-xs text-gray-500 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                    {badge}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right: Fingerprint scanner */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <HeroScanner />
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-6 text-center">
                <div className="text-3xl font-black gradient-text">
                  <CountUp end={s.value} duration={2.5} decimals={s.value % 1 !== 0 ? 1 : 0} />
                  {s.suffix}
                </div>
                <div className="text-sm text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Security Features */}
      <section id="security" className="py-24 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-4">
              <Shield className="w-4 h-4" /> Enterprise Security
            </div>
            <h2 className="text-4xl font-black mb-4">Built for <span className="gradient-text">Zero Trust</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Every vote is protected by multiple layers of cryptographic security and biometric identity verification.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl p-6 group hover:border-primary-500/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">One Platform, <span className="gradient-text">Every Election</span></h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From student councils to corporate boards — biometric voting for every use case.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((uc, i) => (
            <motion.div key={uc.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ y: -6 }}
              className="glass rounded-2xl p-6 cursor-pointer group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${uc.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <uc.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{uc.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{uc.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Trusted by <span className="gradient-text">Organizations</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Frequently Asked <span className="gradient-text">Questions</span></h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} className="max-w-4xl mx-auto text-center glass rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10 pointer-events-none" />
          <Fingerprint className="w-16 h-16 text-primary-400/30 mx-auto mb-4" />
          <h2 className="text-4xl font-black mb-4 relative">Ready for biometric voting?</h2>
          <p className="text-gray-400 text-lg mb-8 relative">
            Join 300+ organizations using VoteSphere Biometric for secure, transparent elections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
            <Link href="/register"><Button size="lg">Create Free Account</Button></Link>
            <Link href="/login"><Button variant="secondary" size="lg">Sign In</Button></Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Fingerprint className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold gradient-text">VoteSphere Biometric</span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 VoteSphere. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
