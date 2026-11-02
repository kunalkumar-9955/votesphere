"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { orgApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Building2, CheckCircle, XCircle, Users, Vote } from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgs = () => {
    orgApi.list().then((r) => setOrgs(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrgs(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await orgApi.updateStatus(id, { status });
      toast.success(`Organization ${status}`);
      fetchOrgs();
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Organizations</h1>
        <p className="text-gray-400 text-sm mt-1">{orgs.length} organizations registered</p>
      </div>

      <div className="space-y-4">
        {orgs.map((org, i) => (
          <motion.div key={org.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{org.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 capitalize">{org.type}</span>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="text-xs text-gray-500">Code: {org.invite_code}</span>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="text-xs text-gray-500">{formatDate(org.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Users className="w-3 h-3" />{org.member_count} members</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Vote className="w-3 h-3" />{org.election_count} elections</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={org.status} />
                  {org.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => updateStatus(org.id, "approved")}>
                        <CheckCircle className="w-4 h-4" /> Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => updateStatus(org.id, "rejected")}>
                        <XCircle className="w-4 h-4" /> Reject
                      </Button>
                    </>
                  )}
                  {org.status === "approved" && (
                    <Button size="sm" variant="danger" onClick={() => updateStatus(org.id, "suspended")}>
                      Suspend
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
        {orgs.length === 0 && (
          <div className="text-center py-16 text-gray-500">No organizations yet</div>
        )}
      </div>
    </div>
  );
}
