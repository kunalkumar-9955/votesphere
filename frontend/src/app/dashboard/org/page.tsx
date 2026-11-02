"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { electionApi, orgApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/ui/Skeleton";
import { Vote, Users, PlusCircle, BarChart3, Calendar, TrendingUp, ArrowRight, Zap, Building2 } from "lucide-react";
import { formatDateTime, getElectionTypeLabel } from "@/lib/utils";
import CountUp from "react-countup";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export default function OrgDashboard() {
  const [elections, setElections] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([electionApi.list(), orgApi.list()])
      .then(([e, o]) => { setElections(e.data); setOrgs(o.data); })
      .finally(() => setLoading(false));
  }, []);

  const activeElections = elections.filter((e) => e.status === "active");
  const totalVotes = elections.reduce((sum, e) => sum + (e.total_votes || 0), 0);

  // Mini sparkline data from elections
  const sparkData = elections.slice(-7).map((e, i) => ({ i, votes: e.total_votes || 0 }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Organization Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Manage elections, members, and results</p>
        </div>
        <Link href="/dashboard/org/elections/create">
          <Button className="shadow-lg shadow-primary-500/20">
            <PlusCircle className="w-4 h-4" /> New Election
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />) : [
          { label: "Total Elections", value: elections.length, icon: Vote, color: "text-primary-400", bg: "bg-primary-500/10", border: "border-primary-500/20" },
          { label: "Active Now", value: activeElections.length, icon: Zap, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
          { label: "Total Votes", value: totalVotes, icon: BarChart3, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          { label: "Organizations", value: orgs.length, icon: Building2, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={`p-5 border ${s.border}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <div className={`text-2xl font-black ${s.color}`}>
                <CountUp end={s.value} duration={1.2} />
              </div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Active elections highlight */}
      {!loading && activeElections.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <h2 className="text-base font-semibold text-white">Live Elections</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeElections.slice(0, 2).map((e, i) => (
              <motion.div key={e.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                <Card className="p-5 border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold text-sm">{e.title}</h3>
                      <p className="text-gray-500 text-xs mt-0.5">{getElectionTypeLabel(e.type)}</p>
                    </div>
                    <StatusBadge status="active" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-green-400">{e.total_votes}</p>
                      <p className="text-xs text-gray-500">votes cast</p>
                    </div>
                    <div className="w-24 h-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[{ v: 0 }, { v: e.total_votes * 0.3 }, { v: e.total_votes * 0.6 }, { v: e.total_votes }]}>
                          <Area type="monotone" dataKey="v" stroke="#10b981" fill="rgba(16,185,129,0.1)" strokeWidth={1.5} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <Link href={`/dashboard/org/elections/${e.id}`} className="mt-3 block">
                    <Button size="sm" variant="outline" className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10">
                      Manage <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All elections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">All Elections</h2>
          <Link href="/dashboard/org/elections" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">View all</Link>
        </div>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} />)}</div>
        ) : (
          <div className="space-y-3">
            {elections.slice(0, 6).map((e, i) => (
              <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="p-4 hover:border-white/20 transition-colors group">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                        <Vote className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-sm">{e.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">{getElectionTypeLabel(e.type)}</span>
                          <span className="text-gray-700">•</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{formatDateTime(e.end_time)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-300">{e.total_votes} <span className="text-xs text-gray-500 font-normal">votes</span></span>
                      <StatusBadge status={e.status} />
                      <Link href={`/dashboard/org/elections/${e.id}`}>
                        <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            {elections.length === 0 && (
              <div className="text-center py-16 text-gray-600">
                <Vote className="w-14 h-14 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No elections yet</p>
                <Link href="/dashboard/org/elections/create" className="mt-3 inline-block">
                  <Button size="sm" className="mt-2">Create First Election</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
