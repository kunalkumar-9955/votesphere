"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { electionApi, biometricApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/ui/Skeleton";
import { Vote, Clock, CheckCircle, Calendar, ArrowRight, Sparkles, Shield, Fingerprint } from "lucide-react";
import { formatDateTime, getElectionTypeLabel } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import CountUp from "react-countup";

export default function VoterDashboard() {
  const [elections, setElections] = useState<any[]>([]);
  const [myVotes, setMyVotes] = useState<any[]>([]);
  const [biometricCount, setBiometricCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    Promise.all([
      electionApi.list({ status: "active" }),
      electionApi.myVotes(),
      biometricApi.listCredentials(),
    ]).then(([e, v, b]) => {
      setElections(e.data);
      setMyVotes(v.data);
      setBiometricCount(b.data.length);
    }).finally(() => setLoading(false));
  }, []);

  const votedIds = new Set(myVotes.map((v: any) => v.election_id));
  const pending = elections.filter((e) => !votedIds.has(e.id));

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-primary-500/20 via-accent-500/10 to-transparent border border-primary-500/20">
        <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none">
          <Vote className="w-full h-full" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">Your Voting Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name.split(" ")[0]} 👋</h1>
          <p className="text-gray-400 text-sm mt-1">
            {pending.length > 0
              ? `You have ${pending.length} election${pending.length > 1 ? "s" : ""} waiting for your vote.`
              : "You're all caught up! No pending votes."}
          </p>
        </div>
      </motion.div>

      {/* Biometric enrollment prompt */}
      {!loading && biometricCount === 0 && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-4 border-primary-500/30 bg-gradient-to-r from-primary-500/10 to-accent-500/5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Enable Biometric Voting</p>
                  <p className="text-gray-400 text-xs mt-0.5">Register your fingerprint for faster, more secure voting</p>
                </div>
              </div>
              <Link href="/biometric/enroll">
                <Button size="sm">
                  <Fingerprint className="w-3.5 h-3.5" /> Enroll Now
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      )}

      {!loading && biometricCount > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 w-fit">
            <Fingerprint className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs text-green-400 font-medium">{biometricCount} biometric device{biometricCount > 1 ? "s" : ""} enrolled</span>
            <CheckCircle className="w-3 h-3 text-green-400" />
          </div>
        </motion.div>
      )}
      <div className="grid grid-cols-3 gap-4">
        {loading ? Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />) : [
          { label: "Active Elections", value: elections.length, icon: Vote, color: "text-primary-400", bg: "bg-primary-500/10", border: "border-primary-500/20" },
          { label: "Votes Cast", value: myVotes.length, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
          { label: "Pending Votes", value: pending.length, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={`p-5 border ${s.border}`}>
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className={`text-2xl font-black ${s.color}`}>
                <CountUp end={s.value} duration={1.2} />
              </div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pending votes — highlighted */}
      {!loading && pending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-yellow-400" />
            <h2 className="text-base font-semibold text-white">Awaiting Your Vote</h2>
            <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full">{pending.length}</span>
          </div>
          <div className="space-y-3">
            {pending.map((e, i) => (
              <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4 border-yellow-500/20 hover:border-yellow-500/40 transition-colors group">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center border border-primary-500/20">
                        <Vote className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-sm">{e.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">{getElectionTypeLabel(e.type)}</span>
                          <span className="text-gray-700">•</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />Ends {formatDateTime(e.end_time)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/vote/${e.id}`}>
                      <Button size="sm" className="group-hover:shadow-lg group-hover:shadow-primary-500/20 transition-shadow">
                        Vote Now <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All active elections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">All Active Elections</h2>
          <Link href="/dashboard/voter/elections" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">View all</Link>
        </div>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <TableRowSkeleton key={i} />)}</div>
        ) : (
          <div className="space-y-3">
            {elections.map((e, i) => {
              const hasVoted = votedIds.has(e.id);
              return (
                <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className={`p-4 transition-colors ${hasVoted ? "border-green-500/20" : "hover:border-white/20"}`}>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasVoted ? "bg-green-500/20" : "bg-primary-500/20"}`}>
                          {hasVoted
                            ? <CheckCircle className="w-5 h-5 text-green-400" />
                            : <Vote className="w-5 h-5 text-primary-400" />}
                        </div>
                        <div>
                          <h3 className="text-white font-medium text-sm">{e.title}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">{getElectionTypeLabel(e.type)}</span>
                            <span className="text-gray-700">•</span>
                            <span className="text-xs text-gray-500">{e.total_votes} votes cast</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={e.status} />
                        {hasVoted ? (
                          <span className="text-xs text-green-400 flex items-center gap-1 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                            <CheckCircle className="w-3 h-3" /> Voted
                          </span>
                        ) : (
                          <Link href={`/vote/${e.id}`}>
                            <Button size="sm" variant="outline">Cast Vote</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
            {elections.length === 0 && (
              <div className="text-center py-16 text-gray-600">
                <Vote className="w-14 h-14 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No active elections right now</p>
                <p className="text-xs mt-1 text-gray-700">Check back later or join an organization</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
