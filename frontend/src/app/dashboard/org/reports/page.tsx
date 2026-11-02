"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { electionApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { FileText, Download, BarChart3, Trophy, Vote } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDateTime, getElectionTypeLabel } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";

export default function OrgReportsPage() {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    electionApi.list({ limit: 100 }).then((r) => setElections(r.data)).finally(() => setLoading(false));
  }, []);

  const downloadPDF = async (id: number, title: string) => {
    setDownloading(id);
    try {
      const res = await electionApi.report(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/\s+/g, "_")}_report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Report downloaded!");
    } catch {
      toast.error("Report only available after results are published");
    } finally {
      setDownloading(null);
    }
  };

  const completed = elections.filter((e) => ["ended", "result_published"].includes(e.status));
  const active = elections.filter((e) => e.status === "active");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports & Exports</h1>
        <p className="text-gray-400 text-sm mt-1">Download PDF reports for completed elections</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Elections", value: elections.length, icon: Vote, color: "text-primary-400", bg: "bg-primary-500/10", border: "border-primary-500/20" },
          { label: "Active", value: active.length, icon: BarChart3, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
          { label: "Completed", value: completed.length, icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
        ].map((s, i) => (
          <Card key={s.label} className={`p-5 border ${s.border}`}>
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Elections list */}
      <Card className="p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-400" /> All Elections
        </h3>
        {loading ? (
          <div className="space-y-3">{Array.from({length:4}).map((_,i)=><TableRowSkeleton key={i}/>)}</div>
        ) : elections.length > 0 ? (
          <div className="space-y-3">
            {elections.map((e, i) => (
              <motion.div key={e.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/8 hover:border-white/15 transition-colors flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary-500/20 flex items-center justify-center">
                      <Vote className="w-4 h-4 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{e.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                        <span>{getElectionTypeLabel(e.type)}</span>
                        <span>·</span>
                        <span>{e.total_votes} votes</span>
                        <span>·</span>
                        <span>{formatDateTime(e.end_time)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={e.status} />
                    {e.status === "result_published" && (
                      <Link href={`/results/${e.id}`}>
                        <Button size="sm" variant="outline">
                          <Trophy className="w-3.5 h-3.5" /> Results
                        </Button>
                      </Link>
                    )}
                    <Button size="sm" variant="secondary" loading={downloading === e.id}
                      onClick={() => downloadPDF(e.id, e.title)}>
                      <Download className="w-3.5 h-3.5" /> PDF
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No elections yet</p>
          </div>
        )}
      </Card>
    </div>
  );
}
