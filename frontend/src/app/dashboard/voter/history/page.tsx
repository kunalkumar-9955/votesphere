"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { electionApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { CheckCircle, FileText, Copy, Clock } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";

export default function VoteHistoryPage() {
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    electionApi.myVotes().then((r) => setVotes(r.data)).finally(() => setLoading(false));
  }, []);

  const copyReceipt = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Receipt copied!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Vote History</h1>
        <p className="text-gray-400 text-sm mt-1">{votes.length} votes cast — all receipts are cryptographically verified</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} />)}</div>
      ) : votes.length > 0 ? (
        <div className="space-y-3">
          {votes.map((v, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 border-green-500/10 hover:border-green-500/20 transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Election #{v.election_id}</p>
                      <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />{formatDateTime(v.voted_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-0.5">Receipt Code</p>
                      <p className="text-xs font-mono text-primary-400 max-w-[140px] truncate">{v.receipt_code}</p>
                    </div>
                    <button onClick={() => copyReceipt(v.receipt_code)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-600">
          <FileText className="w-14 h-14 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No votes cast yet</p>
          <p className="text-xs mt-1 text-gray-700">Your voting history will appear here</p>
        </div>
      )}
    </div>
  );
}
