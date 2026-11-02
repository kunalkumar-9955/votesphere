"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { electionApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { Vote, PlusCircle, Search, Calendar, BarChart3 } from "lucide-react";
import { formatDateTime, getElectionTypeLabel } from "@/lib/utils";

const STATUSES = ["all", "draft", "scheduled", "active", "paused", "ended", "result_published"];

export default function OrgElectionsPage() {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    electionApi.list({ limit: 100 }).then((r) => setElections(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = elections.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Elections</h1>
          <p className="text-gray-400 text-sm mt-1">{elections.length} total elections</p>
        </div>
        <Link href="/dashboard/org/elections/create">
          <Button><PlusCircle className="w-4 h-4" /> New Election</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search elections..."
            className="pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-56" />
        </div>
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl overflow-x-auto">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize whitespace-nowrap
                ${statusFilter === s ? "bg-primary-500 text-white" : "text-gray-400 hover:text-white"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:4}).map((_,i)=><TableRowSkeleton key={i}/>)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e, i) => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="p-4 hover:border-white/20 transition-colors group">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                      <Vote className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm">{e.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 flex-wrap">
                        <span>{getElectionTypeLabel(e.type)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDateTime(e.end_time)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{e.total_votes} votes</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
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
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-600">
              <Vote className="w-14 h-14 mx-auto mb-3 opacity-20" />
              <p className="text-sm">{search ? "No elections match your search" : "No elections yet"}</p>
              {!search && (
                <Link href="/dashboard/org/elections/create" className="mt-3 inline-block">
                  <Button size="sm" className="mt-2">Create First Election</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
