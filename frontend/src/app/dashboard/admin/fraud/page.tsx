"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { analyticsApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/ui/Skeleton";
import { AlertTriangle, Shield, TrendingUp, Flag, Activity, Eye, Clock } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatDateTime } from "@/lib/utils";

const RISK_COLORS: Record<string, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#ef4444",
  critical: "#dc2626",
};

const RISK_BG: Record<string, string> = {
  low: "bg-green-500/10 border-green-500/20 text-green-400",
  medium: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  high: "bg-red-500/10 border-red-500/20 text-red-400",
  critical: "bg-red-600/20 border-red-600/30 text-red-300",
};

export default function FraudReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.fraudReports().then((r) => setReport(r.data)).finally(() => setLoading(false));
  }, []);

  const riskDist = report?.risk_distribution
    ? [
        { name: "Low", value: report.risk_distribution.low, fill: "#10b981" },
        { name: "Medium", value: report.risk_distribution.medium, fill: "#f59e0b" },
        { name: "High", value: report.risk_distribution.high, fill: "#ef4444" },
        { name: "Critical", value: report.risk_distribution.critical, fill: "#dc2626" },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fraud Detection</h1>
          <p className="text-gray-400 text-sm mt-1">AI-powered suspicious voting analysis</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
          <Activity className="w-3.5 h-3.5 text-red-400" />
          <span className="text-xs text-red-400 font-medium">Monitoring Active</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />) : report && [
          { label: "Total Votes", value: report.total_votes, icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          { label: "Flagged Votes", value: report.total_flagged, icon: Flag, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
          { label: "Avg Fraud Score", value: report.avg_fraud_score?.toFixed(3), icon: TrendingUp, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", raw: true },
          { label: "Flag Rate", value: `${report.flag_rate}%`, icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", raw: true },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={`p-5 border ${s.border}`}>
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk distribution pie */}
          <Card className="p-6">
            <h3 className="text-white font-semibold mb-4">Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={riskDist} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {riskDist.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px", color: "#f9fafb", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {riskDist.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
                  <span className="text-gray-400">{d.name}</span>
                  <span className="text-white font-medium ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* High risk elections */}
          <Card className="lg:col-span-2 p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              High Risk Elections
            </h3>
            {report.high_risk_elections?.length > 0 ? (
              <div className="space-y-3">
                {report.high_risk_elections.map((e: any, i: number) => (
                  <motion.div key={e.election_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Election #{e.election_id}</p>
                        <p className="text-gray-500 text-xs">{e.flagged_count} flagged votes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Avg Score</p>
                        <p className="text-sm font-bold text-red-400">{e.avg_score}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${RISK_BG[e.risk_level] || RISK_BG.medium}`}>
                        {e.risk_level}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-gray-600">
                <Shield className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">No high-risk elections detected</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Recent flagged votes table */}
      {report?.recent_flagged?.length > 0 && (
        <Card className="p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary-400" />
            Recent Flagged Votes
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Vote ID", "User ID", "Election", "Score", "Risk", "IP Address", "Time"].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {report.recent_flagged.slice(0, 10).map((v: any) => (
                  <tr key={v.vote_id} className="hover:bg-white/3 transition-colors">
                    <td className="py-3 pr-4 text-gray-300 font-mono text-xs">#{v.vote_id}</td>
                    <td className="py-3 pr-4 text-gray-300">#{v.user_id}</td>
                    <td className="py-3 pr-4 text-gray-300">#{v.election_id}</td>
                    <td className="py-3 pr-4">
                      <span className="font-bold" style={{ color: RISK_COLORS[v.risk_level] || "#f59e0b" }}>
                        {v.fraud_score}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${RISK_BG[v.risk_level] || RISK_BG.medium}`}>
                        {v.risk_level}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-500 font-mono text-xs">{v.ip_address || "—"}</td>
                    <td className="py-3 text-gray-500 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {v.created_at ? new Date(v.created_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
