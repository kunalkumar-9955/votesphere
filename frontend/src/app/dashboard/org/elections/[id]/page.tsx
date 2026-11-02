"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { electionApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Vote, UserPlus, Trophy, Download, Play, Pause, BarChart3, Trash2, Users, Clock, ArrowLeft, RefreshCw } from "lucide-react";
import { formatDateTime, getElectionTypeLabel } from "@/lib/utils";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

const CANDIDATE_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

export default function ManageElectionPage() {
  const { id } = useParams();
  const [election, setElection] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [turnout, setTurnout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingCandidate, setAddingCandidate] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "candidates" | "turnout">("overview");

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchData = useCallback(async () => {
    try {
      const [e, c] = await Promise.all([
        electionApi.get(Number(id)),
        electionApi.getCandidates(Number(id)),
      ]);
      setElection(e.data);
      setCandidates(c.data);
      if (["active", "paused"].includes(e.data.status)) {
        const t = await electionApi.turnout(Number(id));
        setTurnout(t.data);
      }
    } catch {
      toast.error("Failed to load election data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh turnout every 30s when active
  useEffect(() => {
    if (election?.status !== "active") return;
    const t = setInterval(() => {
      electionApi.turnout(Number(id)).then((r) => setTurnout(r.data)).catch(() => {});
    }, 30000);
    return () => clearInterval(t);
  }, [election?.status, id]);

  const addCandidate = async (data: any) => {
    setAddingCandidate(true);
    try {
      await electionApi.addCandidate({ ...data, election_id: Number(id) });
      toast.success("Candidate added!");
      reset();
      setShowAddForm(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to add candidate");
    } finally {
      setAddingCandidate(false);
    }
  };

  const deleteCandidate = async (cid: number) => {
    if (!confirm("Remove this candidate?")) return;
    try {
      // Candidate delete endpoint — /elections/candidates/{id}
      await electionApi.deleteCandidate(cid);
      toast.success("Candidate removed");
      fetchData();
    } catch {
      toast.error("Failed to remove candidate");
    }
  };

  const updateStatus = async (status: string) => {
    try {
      await electionApi.update(Number(id), { status });
      toast.success(`Election ${status}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update");
    }
  };

  const publishResult = async () => {
    if (!confirm("Publish results? This will end the election.")) return;
    try {
      await electionApi.publishResult(Number(id));
      toast.success("Results published!");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to publish");
    }
  };

  const downloadReport = async () => {
    try {
      const res = await electionApi.report(Number(id));
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url; a.download = `election_${id}_report.pdf`; a.click();
      toast.success("Report downloaded!");
    } catch {
      toast.error("Failed to download report");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );

  const totalVotes = turnout?.total_votes || 0;
  const turnoutPct = turnout?.turnout_percentage || 0;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back */}
      <Link href="/dashboard/org" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{election?.title}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <StatusBadge status={election?.status} />
            <span className="text-xs text-gray-500">{getElectionTypeLabel(election?.type)}</span>
            <span className="text-xs text-gray-600">•</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />{formatDateTime(election?.start_time)} → {formatDateTime(election?.end_time)}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {election?.status === "draft" && (
            <Button size="sm" onClick={() => updateStatus("active")}>
              <Play className="w-4 h-4" /> Start Election
            </Button>
          )}
          {election?.status === "active" && (
            <>
              <Button size="sm" variant="secondary" onClick={() => updateStatus("paused")}>
                <Pause className="w-4 h-4" /> Pause
              </Button>
              <Button size="sm" onClick={publishResult}>
                <Trophy className="w-4 h-4" /> Publish Result
              </Button>
            </>
          )}
          {election?.status === "paused" && (
            <Button size="sm" onClick={() => updateStatus("active")}>
              <Play className="w-4 h-4" /> Resume
            </Button>
          )}
          {["ended", "result_published"].includes(election?.status) && (
            <Button size="sm" variant="secondary" onClick={downloadReport}>
              <Download className="w-4 h-4" /> PDF Report
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={fetchData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl w-fit">
        {(["overview", "candidates", "turnout"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize
              ${activeTab === tab ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20" : "text-gray-400 hover:text-white"}`}>
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Overview tab */}
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5">
              <p className="text-xs text-gray-500 mb-1">Total Votes</p>
              <p className="text-3xl font-black text-primary-400">{totalVotes}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-gray-500 mb-1">Turnout</p>
              <p className="text-3xl font-black text-green-400">{turnoutPct.toFixed(1)}%</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-gray-500 mb-1">Candidates</p>
              <p className="text-3xl font-black text-blue-400">{candidates.length}</p>
            </Card>
            {election?.description && (
              <Card className="p-5 md:col-span-3">
                <p className="text-xs text-gray-500 mb-2">Description</p>
                <p className="text-gray-300 text-sm leading-relaxed">{election.description}</p>
              </Card>
            )}
          </motion.div>
        )}

        {/* Candidates tab */}
        {activeTab === "candidates" && (
          <motion.div key="candidates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-400" />
                Candidates ({candidates.length})
              </h3>
              {["draft", "scheduled"].includes(election?.status) && (
                <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
                  <UserPlus className="w-4 h-4" /> Add Candidate
                </Button>
              )}
            </div>

            {/* Add form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <Card className="p-5 border-primary-500/20">
                    <form onSubmit={handleSubmit(addCandidate)} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Full Name *" placeholder="Candidate name"
                          error={errors.name?.message as string}
                          {...register("name", { required: "Name is required" })} />
                        <Input label="Party / Position" placeholder="e.g. Progressive Front" {...register("party")} />
                      </div>
                      <Input label="Bio" placeholder="Brief candidate description" {...register("bio")} />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" loading={addingCandidate}>Add Candidate</Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
                      </div>
                    </form>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              {candidates.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-black text-white flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]}40, ${CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]}20)`, border: `1px solid ${CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]}30` }}>
                        {c.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{c.name}</p>
                        <p className="text-gray-500 text-xs">{c.party || c.position || "Independent"}</p>
                        {c.bio && <p className="text-gray-600 text-xs mt-0.5 line-clamp-1">{c.bio}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-white font-bold">{c.vote_count}</p>
                          <p className="text-xs text-gray-500">votes</p>
                        </div>
                        {["draft", "scheduled"].includes(election?.status) && (
                          <button onClick={() => deleteCandidate(c.id)}
                            className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
              {candidates.length === 0 && (
                <div className="text-center py-12 text-gray-600">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No candidates yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Turnout tab */}
        {activeTab === "turnout" && (
          <motion.div key="turnout" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-6">
            {turnout ? (
              <>
                {/* Turnout gauge */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary-400" /> Live Turnout
                    </h3>
                    <div className="flex items-center gap-6 mb-4">
                      <div>
                        <p className="text-4xl font-black text-primary-400">{totalVotes}</p>
                        <p className="text-xs text-gray-500">votes cast</p>
                      </div>
                      <div>
                        <p className="text-4xl font-black text-green-400">{turnoutPct.toFixed(1)}%</p>
                        <p className="text-xs text-gray-500">turnout</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(turnoutPct, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{turnout.total_eligible} eligible voters</p>
                  </Card>

                  {/* Candidate bar chart */}
                  <Card className="p-6">
                    <h3 className="text-white font-semibold mb-4">Vote Distribution</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={turnout.candidates} layout="vertical" margin={{ left: 0, right: 20 }}>
                        <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
                        <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px", color: "#f9fafb", fontSize: "12px" }} />
                        <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                          {turnout.candidates?.map((_: any, i: number) => (
                            <Cell key={i} fill={CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                {/* Candidate list with progress bars */}
                <Card className="p-6">
                  <h3 className="text-white font-semibold mb-4">Candidate Standings</h3>
                  <div className="space-y-4">
                    {turnout.candidates?.sort((a: any, b: any) => b.votes - a.votes).map((c: any, i: number) => {
                      const pct = totalVotes > 0 ? (c.votes / totalVotes * 100) : 0;
                      return (
                        <div key={c.id}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              {i === 0 && totalVotes > 0 && <Trophy className="w-3.5 h-3.5 text-yellow-400" />}
                              <span className="text-sm text-white font-medium">{c.name}</span>
                            </div>
                            <span className="text-sm font-bold" style={{ color: CANDIDATE_COLORS[i % CANDIDATE_COLORS.length] }}>
                              {c.votes} <span className="text-xs text-gray-500 font-normal">({pct.toFixed(1)}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                              className="h-full rounded-full"
                              style={{ background: CANDIDATE_COLORS[i % CANDIDATE_COLORS.length] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </>
            ) : (
              <div className="text-center py-16 text-gray-600">
                <BarChart3 className="w-14 h-14 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Turnout data available once election is active</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
