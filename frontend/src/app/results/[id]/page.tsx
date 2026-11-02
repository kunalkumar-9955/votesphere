"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { electionApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Trophy, Users, BarChart3, ArrowLeft, Crown, Medal, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";

const COLORS = ["#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444"];
const RANK_ICONS = [Crown, Medal, Award];

export default function ResultsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    electionApi.getResult(Number(id))
      .then((r) => setResult(r.data))
      .catch((err) => {
        const msg = err.response?.data?.detail || "Results not available yet";
        toast.error(msg);
        router.back();
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!result) return null;

  const sorted = [...(result.candidates || [])].sort((a, b) => b.vote_count - a.vote_count);
  const total = result.total_votes || 0;

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-3xl mx-auto py-8 space-y-6">
        {/* Back */}
        <button onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 border-primary-500/20 bg-gradient-to-br from-primary-500/5 to-accent-500/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Election Results</h1>
                {result.published_at && (
                  <p className="text-gray-500 text-xs mt-0.5">Published {formatDateTime(result.published_at)}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-xs text-gray-500">Total Votes</p>
                <p className="text-2xl font-black text-white">{total.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-xs text-gray-500">Turnout</p>
                <p className="text-2xl font-black text-green-400">{result.turnout_percentage?.toFixed(1)}%</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Winner */}
        {result.winner_name && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card className="p-6 border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 text-center">
              <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ repeat: 3, duration: 0.4, delay: 0.5 }}>
                <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
              </motion.div>
              <p className="text-xs text-yellow-500 uppercase tracking-widest mb-1">Winner</p>
              <h2 className="text-3xl font-black text-white">{result.winner_name}</h2>
              {sorted[0] && (
                <p className="text-gray-400 text-sm mt-1">
                  {sorted[0].vote_count} votes ({total > 0 ? ((sorted[0].vote_count / total) * 100).toFixed(1) : 0}%)
                </p>
              )}
            </Card>
          </motion.div>
        )}

        {/* Candidate rankings */}
        <Card className="p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary-400" /> Candidate Results
          </h3>
          <div className="space-y-4">
            {sorted.map((c, i) => {
              const pct = total > 0 ? (c.vote_count / total) * 100 : 0;
              const RankIcon = RANK_ICONS[i] || null;
              return (
                <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: `${COLORS[i % COLORS.length]}20`, color: COLORS[i % COLORS.length] }}>
                        {i + 1}
                      </div>
                      {RankIcon && <RankIcon className="w-4 h-4" style={{ color: COLORS[i % COLORS.length] }} />}
                      <span className="text-white font-medium text-sm">{c.name}</span>
                      {c.party && <span className="text-gray-500 text-xs">· {c.party}</span>}
                    </div>
                    <span className="text-sm font-bold" style={{ color: COLORS[i % COLORS.length] }}>
                      {c.vote_count} <span className="text-xs text-gray-500 font-normal">({pct.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i+1) % COLORS.length]})` }} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* Bar chart */}
        {sorted.length > 0 && (
          <Card className="p-6">
            <h3 className="text-white font-semibold mb-4">Vote Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sorted} margin={{ top: 5, right: 5, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} axisLine={false} angle={-20} textAnchor="end" />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px", color: "#f9fafb", fontSize: "12px" }} />
                <Bar dataKey="vote_count" name="Votes" radius={[6,6,0,0]}>
                  {sorted.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        <Button variant="secondary" onClick={() => router.back()} className="w-full">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
