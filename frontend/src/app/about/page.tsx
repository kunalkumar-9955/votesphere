"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Users, BookOpen, Target, Award, Check,
  ArrowRight, Github, Mail
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm mb-6">
              <BookOpen className="w-3.5 h-3.5" /> About Us
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              Reimagining Voting
            </h1>
            <p className="text-xl text-gray-400">
              VoteSphere combines biometric security, cryptography, and AI fraud detection to create
              the world's most secure and transparent voting platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 bg-white/3">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-gray-400 mb-4">
                We believe every vote deserves to be heard, verified, and protected. VoteSphere democratizes
                secure voting technology, making it accessible to colleges, corporations, NGOs, and communities
                worldwide.
              </p>
              <p className="text-gray-400">
                By combining fingerprint biometrics, end-to-end encryption, and blockchain-inspired audit trails,
                we've created a platform that is simultaneously secure, private, and auditable.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { num: "50K+", label: "Votes Cast" },
                { num: "1200+", label: "Elections" },
                { num: "300+", label: "Organizations" },
                { num: "99.9%", label: "Uptime" },
              ].map((stat, i) => (
                <Card key={stat.label} className="p-6 text-center">
                  <p className="text-3xl font-black text-primary-400">{stat.num}</p>
                  <p className="text-sm text-gray-400 mt-2">{stat.label}</p>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Democracy",
                desc: "Every vote counts equally. We eliminate fraud, duplication, and coercion.",
              },
              {
                icon: Target,
                title: "Transparency",
                desc: "Full audit trails, vote receipts, and immutable records for complete accountability.",
              },
              {
                icon: Award,
                title: "Excellence",
                desc: "Enterprise-grade security, 24/7 monitoring, and continuous innovation.",
              },
            ].map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-8 h-full text-center hover:scale-[1.02] transition-transform">
                  <div className="w-14 h-14 rounded-xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-primary-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-gray-400">{value.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4 bg-white/3">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Tech Stack</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Backend",
                stack: ["FastAPI (Python)", "SQLAlchemy ORM", "PostgreSQL", "Redis", "JWT Auth", "scikit-learn"],
              },
              {
                title: "Frontend",
                stack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Framer Motion", "Zustand", "Recharts"],
              },
              {
                title: "Security",
                stack: ["WebAuthn/FIDO2", "AES-256 Encryption", "bcrypt Hashing", "TLS/SSL", "Rate Limiting"],
              },
              {
                title: "DevOps",
                stack: ["Docker", "GitHub Actions", "Automated Testing", "Security Scanning", "CDN"],
              },
            ].map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4 text-primary-400">{cat.title}</h3>
                  <ul className="space-y-2">
                    {cat.stack.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-gray-400">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Source */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Github className="w-12 h-12 text-primary-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Open Source</h2>
            <p className="text-gray-400 mb-8">
              VoteSphere is built on open-source principles. Our code is auditable, secure by default,
              and available for community review and contribution.
            </p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button>
                View on GitHub <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 px-4 bg-white/3">
        <div className="max-w-2xl mx-auto text-center">
          <Mail className="w-12 h-12 text-primary-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
          <p className="text-gray-400 mb-8">
            Questions? Interested in partnership? We'd love to hear from you.
          </p>
          <a href="mailto:hello@votesphere.com">
            <Button>
              Contact Us <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
