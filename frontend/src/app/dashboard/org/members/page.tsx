"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { orgApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { Users, Copy, QrCode, UserCheck, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

export default function OrgMembersPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orgApi.list().then((r) => setOrgs(r.data)).finally(() => setLoading(false));
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Invite code copied!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Members & Invite Codes</h1>
        <p className="text-gray-400 text-sm mt-1">Manage organization membership</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:2}).map((_,i)=><TableRowSkeleton key={i}/>)}</div>
      ) : orgs.map((org, i) => (
        <motion.div key={org.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <Card className="p-6">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{org.name}</h3>
                  <p className="text-gray-500 text-xs capitalize">{org.type} · {org.member_count} members</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                <QrCode className="w-4 h-4 text-primary-400" />
                <span className="text-white font-mono text-sm font-bold">{org.invite_code}</span>
                <button onClick={() => copyCode(org.invite_code)}
                  className="ml-2 text-gray-400 hover:text-white transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/20">
              <p className="text-xs text-gray-400 mb-1">Share this invite code with voters to let them join your organization.</p>
              <p className="text-xs text-gray-500">Members can join at <span className="text-primary-400">votesphere.app/join</span> or from their voter dashboard.</p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: "Total Members", value: org.member_count, icon: Users },
                { label: "Elections", value: org.election_count, icon: UserCheck },
                { label: "Status", value: org.status, icon: Building2 },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-xl bg-white/5 text-center">
                  <p className="text-white font-bold capitalize">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      ))}

      {!loading && orgs.length === 0 && (
        <div className="text-center py-16 text-gray-600">
          <Users className="w-14 h-14 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No organizations yet</p>
        </div>
      )}
    </div>
  );
}
