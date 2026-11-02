"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { electionApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { Vote, CheckCircle, Calendar, Search } from "lucide-react";
import { formatDateTime, getElectionTypeLabel } from "@/lib/utils";

export default function VoterElectionsPage() {
  const [elections, setElections] = useState<any[]>([]);
  const [myVotes, setMyVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([electionApi.list({ status: "active" }), electionApi.myVotes()])
      .then(([e, v]) => { setElections(e.data); setMyVotes(v.data); })
      .finally(() => setLoading(false));
  }, []);

  const votedIds = new Set(myVotes.map((v: any) => v.election_id));
  const filtered = elections.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Active Elections</h1>
          <p className="text-gray-400 text-sm mt-1">{elections.length} elections available</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search elections..."
            className="pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-64" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e, i) => {
            const hasVoted = votedIds.has(e.id);
            return (
              <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className={`p-4 transition-colors ${hasVoted ? "border-green-500/20" : "hover:border-primary-500/30"}`}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${hasVoted ? "bg-green-500/20" : "bg-primary-500/20"}`}>
                        {hasVoted ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Vote className="w-5 h-5 text-primary-400" />}
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-sm">{e.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-500">{getElectionTypeLabel(e.type)}</span>
                          <span className="text-gray-700">•</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />Ends {formatDateTime(e.end_time)}
                          </span>
                          <span className="text-gray-700">•</span>
                          <span className="text-xs text-gray-500">{e.total_votes} votes</span>
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
                          <Button size="sm">Vote Now</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-600">
              <Vote className="w-14 h-14 mx-auto mb-3 opacity-20" />
              <p className="text-sm">{search ? "No elections match your search" : "No active elections"}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
