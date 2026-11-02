"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { analyticsApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { ChartSkeleton, StatCardSkeleton } from "@/components/ui/Skeleton";
import { TrendingUp, BarChart3, PieChart, Activity } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444","#ec4899","#84cc16"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs border border-white/10">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [trends, setTrends] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.voteTrends(30), analyticsApi.electionTypes()])
      .then(([t, d]) => { setTrends(t.data); setTypes(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const totalVotes = trends.reduce((s, t) => s + t.votes, 0);
  const avgDaily = trends.length ? Math.round(totalVotes / trends.length) : 0;
  const peak = trends.length ? Math.max(...trends.map((t) => t.votes)) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Platform-wide voting trends and statistics</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {loading ? Array.from({length:3}).map((_,i)=><StatCardSkeleton key={i}/>) : [
          { label: "Total Votes (30d)", value: totalVotes, icon: BarChart3, color: "text-primary-400", bg: "bg-primary-500/10", border: "border-primary-500/20" },
          { label: "Daily Average", value: avgDaily, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
          { label: "Peak Day", value: peak, icon: Activity, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={`p-5 border ${s.border}`}>
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value.toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Area chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-semibold">Vote Activity — Last 30 Days</h3>
            <p className="text-gray-500 text-xs mt-0.5">{totalVotes.toLocaleString()} total votes</p>
          </div>
        </div>
        {loading ? <ChartSkeleton height={260} /> : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trends} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="votes" name="Votes" stroke="#6366f1" fill="url(#grad1)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "#6366f1" }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Bar + Pie row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-white font-semibold mb-4">Weekly Breakdown</h3>
          {loading ? <ChartSkeleton height={200} /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trends.slice(-7)} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="votes" name="Votes" fill="#6366f1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-white font-semibold mb-4">Election Type Distribution</h3>
          {loading ? <ChartSkeleton height={200} /> : types.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <RePieChart>
                  <Pie data={types} dataKey="count" nameKey="type" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                    {types.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RePieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {types.map((d, i) => (
                  <div key={d.type} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-400 capitalize truncate">{d.type}</span>
                    <span className="text-white font-medium ml-auto">{d.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-600 text-sm">No data yet</div>
          )}
        </Card>
      </div>
    </div>
  );
}
