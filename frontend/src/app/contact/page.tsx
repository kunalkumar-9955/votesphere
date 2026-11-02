"use client";
import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [responseMessage, setResponseMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage("");

    try {
      const res = await authApi.contact(form);
      const message = res?.data?.message || "Message sent! We'll get back to you soon.";
      toast.success(message);
      setResponseMessage(message);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      const message = error?.response?.data?.detail || "Failed to send message. Please try again.";
      toast.error(message);
      setResponseMessage(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm mb-6">
              <MessageSquare className="w-3.5 h-3.5" /> Contact Us
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              Let's Talk
            </h1>
            <p className="text-xl text-gray-400">
              Have questions? Want to partner with us? We're here to help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Mail, title: "Email", value: "hello@votesphere.com" },
            { icon: Phone, title: "Phone", value: "+1 (555) 123-4567" },
            { icon: MapPin, title: "Office", value: "San Francisco, CA" },
          ].map((info, i) => (
            <motion.div
              key={info.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 text-center h-full">
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="font-semibold mb-2">{info.title}</h3>
                <p className="text-gray-400">{info.value}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Form + FAQ */}
      <section className="py-20 px-4 bg-white/3">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
              <input
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
              <input
                type="text"
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
              <textarea
                placeholder="Tell us how we can help..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
              />
              <Button type="submit" size="lg" className="w-full" loading={loading}>
                <Send className="w-4 h-4" /> Send Message
              </Button>
              {responseMessage && (
                <div className="mt-4 rounded-2xl border border-primary-500/20 bg-white/5 p-4 text-sm text-gray-200">
                  {responseMessage}
                </div>
              )}
            </form>
          </motion.div>

          {/* FAQ */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold">Quick Answers</h2>
            {[
              { q: "How long is the free trial?", a: "14 days with full access to all features. No credit card required." },
              { q: "What's the pricing model?", a: "Pay-per-election or annual plans starting from $99/month for unlimited elections." },
              { q: "Do you offer training?", a: "Yes! We provide onboarding, training, and 24/7 support to all customers." },
              { q: "Can you customize for us?", a: "Absolutely. Enterprise customization available. Contact our sales team." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div>
                  <p className="font-semibold text-primary-400 mb-2">{item.q}</p>
                  <p className="text-gray-400 text-sm">{item.a}</p>
                </div>
              </motion.div>
            ))}

            <Card className="p-6 bg-primary-500/10 border-primary-500/30">
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Response Time</p>
                  <p className="text-sm text-gray-400">We typically respond within 24 hours during business days.</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8">
            Join thousands of organizations using VoteSphere for secure, transparent elections.
          </p>
          <a href="/register">
            <Button size="lg">Start Your Free Trial</Button>
          </a>
        </div>
      </section>
    </div>
  );
}
