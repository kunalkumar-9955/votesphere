"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { orgApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Building2, QrCode, Users, Vote } from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

export default function VoterOrgsPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ invite_code: string }>();

  useEffect(() => {
    orgApi.list().then((r) => setOrgs(r.data)).finally(() => setLoading(false));
  }, []);

  const joinOrg = async (data: { invite_code: string }) => {
    setJoining(true);
    try {
      const res = await orgApi.join(data.invite_code);
      toast.success(res.data.message);
      reset();
      orgApi.list().then((r) => setOrgs(r.data));
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to join");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">My Organizations</h1>
        <p className="text-gray-400 text-sm mt-1">Organizations you're a member of</p>
      </div>

      {/* Join by invite code */}
      <Card className="p-5">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <QrCode className="w-4 h-4 text-primary-400" /> Join Organization
        </h3>
        <form onSubmit={handleSubmit(joinOrg)} className="flex gap-3">
          <Input placeholder="Enter invite code (e.g. NIT2024AB)" className="flex-1"
            {...register("invite_code", { required: true })} />
          <Button type="submit" loading={joining} size="md">Join</Button>
        </form>
      </Card>

      {/* Org list */}
      {loading ? (
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)}</div>
      ) : orgs.length > 0 ? (
        <div className="space-y-3">
          {orgs.map((o, i) => (
            <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{o.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                      <span className="capitalize">{o.type}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{o.member_count}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Vote className="w-3 h-3" />{o.election_count} elections</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-600">
          <Building2 className="w-14 h-14 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No organizations yet</p>
          <p className="text-xs mt-1 text-gray-700">Use an invite code to join one</p>
        </div>
      )}
    </div>
  );
}
