"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { biometricApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/ui/Skeleton";
import { Fingerprint, AlertTriangle, Shield, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const RISK_STYLE: Record<string, string> = {
  0: "text-green-400 bg-green-500/10 border-green-500/20",
  low: "text-green-400 bg-green-500/10 border-green-500/20",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  high: "text-red-400 bg-red-500/10 border-red-500/20",
};

function riskLabel(score: number) {
  if (score >= 70) return { label: "High", style: RISK_STYLE.high };
  if (score >= 40) return { label: "Medium", style: RISK_STYLE.medium };
  return { label: "Low", style: RISK_STYLE.low };
}

export default function BiometricAdminPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    biometricApi.fraudLogs({ limit: 100 })
      .then((r) => setLogs(r.data))
      .finally(() => setLoading(false));
  }, []);

  const total = logs.length;
  const highRisk = logs.filter((l) => l.risk_score >= 70).length;
  const medium = logs.filter((l) => l.risk_score >= 40 && l.risk_score < 70).length;
  const resolved = logs.filter((l) => l.resolved).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Biometric Security Logs</h1>
        <p className="text-gray-400 text-sm mt-1">Fingerprint authentication events and fraud alerts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? Array.from({length:4}).map((_,i)=><StatCardSkeleton key={i}/>) : [
          { label: "Total Events", value: total, icon: Fingerprint, color: "text-primary-400", bg: "bg-primary-500/10", border: "border-primary-500/20" },
          { label: "High Risk", value: highRisk, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
          { label: "Medium Risk", value: medium, icon: Shield, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
          { label: "Resolved", value: resolved, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
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

      {/* Logs table */}
      <Card className="p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-primary-400" />
          Security Event Log
        </h3>
        {loading ? (
          <div className="space-y-2">{Array.from({length:6}).map((_,i)=><TableRowSkeleton key={i} cols={5}/>)}</div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["User", "Action", "Risk Score", "IP Address", "Time", "Status"].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((l, i) => {
                  const risk = riskLabel(l.risk_score);
                  return (
                    <motion.tr key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="hover:bg-white/3 transition-colors">
                      <td className="py-3 pr-4 text-gray-300 text-xs">#{l.user_id || "—"}</td>
                      <td className="py-3 pr-4 text-gray-300 text-xs capitalize">{l.action?.replace(/_/g, " ")}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${risk.style}`}>
                          {l.risk_score} — {risk.label}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-500 font-mono text-xs">{l.ip_address || "—"}</td>
                      <td className="py-3 pr-4 text-gray-500 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {l.created_at ? formatDateTime(l.created_at) : "—"}
                      </td>
                      <td className="py-3">
                        {l.resolved
                          ? <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle className="w-3 h-3" />Resolved</span>
                          : <span className="flex items-center gap-1 text-xs text-yellow-400"><XCircle className="w-3 h-3" />Open</span>}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-600">
            <Fingerprint className="w-14 h-14 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No biometric events logged yet</p>
          </div>
        )}
      </Card>
    </div>
  );
}
