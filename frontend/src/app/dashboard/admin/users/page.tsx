"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { analyticsApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { Users, ShieldOff, ShieldCheck, Search, UserCheck, UserX } from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

const ROLE_COLORS: Record<string, string> = {
  super_admin: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  org_admin: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  voter: "text-gray-400 bg-gray-500/10 border-gray-500/20",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [suspending, setSuspending] = useState<number | null>(null);

  const fetchUsers = () => {
    analyticsApi.users({ limit: 100 }).then((r) => setUsers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleSuspend = async (id: number) => {
    setSuspending(id);
    try {
      const res = await analyticsApi.suspendUser(id);
      toast.success(res.data.message);
      fetchUsers();
    } catch {
      toast.error("Failed to update user");
    } finally {
      setSuspending(null);
    }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    suspended: users.filter((u) => !u.is_active).length,
    unverified: users.filter((u) => !u.is_verified).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-gray-400 text-sm mt-1">{users.length} registered users</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Active", value: stats.active, color: "text-green-400" },
          { label: "Suspended", value: stats.suspended, color: "text-red-400" },
          { label: "Unverified", value: stats.unverified, color: "text-yellow-400" },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
          className="pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-full" />
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u, i) => (
            <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={`p-4 transition-colors ${!u.is_active ? "border-red-500/10 bg-red-500/3" : "hover:border-white/15"}`}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0
                      ${u.is_active ? "bg-gradient-to-br from-primary-500 to-accent-500" : "bg-gray-700"}`}>
                      {u.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-medium">{u.name}</p>
                        {!u.is_verified && (
                          <span className="text-xs text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">Unverified</span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs">{u.email} · Joined {formatDate(u.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${ROLE_COLORS[u.role] || ROLE_COLORS.voter}`}>
                      {u.role?.replace(/_/g, " ")}
                    </span>
                    <StatusBadge status={u.is_active ? "approved" : "suspended"} label={u.is_active ? "Active" : "Suspended"} />
                    <Button size="sm" variant={u.is_active ? "danger" : "outline"}
                      loading={suspending === u.id} onClick={() => toggleSuspend(u.id)}>
                      {u.is_active
                        ? <><ShieldOff className="w-3 h-3" /> Suspend</>
                        : <><ShieldCheck className="w-3 h-3" /> Activate</>}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-600">
              <Users className="w-14 h-14 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
