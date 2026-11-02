"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { analyticsApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { StatCardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import {
  Users, Building2, Vote, BarChart3, TrendingUp,
  AlertTriangle, Activity, Shield, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import CountUp from "react-countup";

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#84cc16"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [typesDist, setTypesDist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.stats(),
      analyticsApi.voteTrends(30),
      analyticsApi.electionTypes(),
    ]).then(([s, t, d]) => {
      setStats(s.data);
      setTrends(t.data);
      setTypesDist(d.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: "Total Users", value: stats.total_users, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", trend: "+12%" },
    { label: "Organizations", value: stats.total_organizations, icon: Building2, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", trend: "+5%" },
    { label: "Total Elections", value: stats.total_elections, icon: Vote, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", trend: "+18%" },
    { label: "Total Votes", value: stats.total_votes, icon: BarChart3, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", trend: "+24%" },
    { label: "Active Elections", value: stats.active_elections, icon: Activity, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", trend: null },
    { label: "Pending Orgs", value: stats.pending_organizations, icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", trend: null },
    { label: "Votes (7 days)", value: stats.votes_last_7_days, icon: TrendingUp, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", trend: "+8%" },
    { label: "New Users (7d)", value: stats.new_users_last_7_days, icon: Shield, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", trend: "+3%" },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time analytics across all organizations</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Live</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}>
              <Card className={`p-5 border ${s.border} hover:scale-[1.02] transition-transform cursor-default`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  {s.trend && (
                    <span className="flex items-center gap-0.5 text-xs text-green-400">
                      <ArrowUpRight className="w-3 h-3" />{s.trend}
                    </span>
                  )}
                </div>
                <div className={`text-2xl font-black ${s.color}`}>
                  <CountUp end={s.value || 0} duration={1.5} separator="," />
                </div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </Card>
            </motion.div>
          ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vote trends */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-semibold">Vote Activity</h3>
              <p className="text-gray-500 text-xs mt-0.5">Last 30 days</p>
            </div>
            <span className="text-xs text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-full border border-primary-500/20">
              {trends.reduce((s, t) => s + t.votes, 0)} total
            </span>
          </div>
          {loading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trends} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="voteGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="votes" name="Votes" stroke="#6366f1" fill="url(#voteGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "#6366f1" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Election type distribution */}
        <Card className="p-6">
          <div className="mb-5">
            <h3 className="text-white font-semibold">Election Types</h3>
            <p className="text-gray-500 text-xs mt-0.5">Distribution</p>
          </div>
          {loading ? <ChartSkeleton /> : typesDist.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={typesDist} dataKey="count" nameKey="type" cx="50%" cy="50%"
                    innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {typesDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3">
                {typesDist.slice(0, 4).map((d, i) => (
                  <div key={d.type} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-400 capitalize">{d.type}</span>
                    </div>
                    <span className="text-white font-medium">{d.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-600 text-sm">No elections yet</div>
          )}
        </Card>
      </div>

      {/* Bar chart */}
      {!loading && trends.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-semibold">Daily Vote Volume</h3>
              <p className="text-gray-500 text-xs mt-0.5">Bar chart view</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={trends.slice(-14)} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="votes" name="Votes" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
