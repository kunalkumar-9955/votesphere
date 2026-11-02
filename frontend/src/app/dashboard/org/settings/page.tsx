"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { orgApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Input";
import { Settings, Building2, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function OrgSettingsPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    orgApi.list().then((r) => {
      setOrgs(r.data);
      if (r.data[0]) reset({ name: r.data[0].name, description: r.data[0].description });
    });
  }, []);

  const onSave = async (data: any) => {
    if (!orgs[0]) return;
    setSaving(true);
    try {
      await orgApi.update(orgs[0].id, data);
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Organization Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Update your organization profile</p>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="space-y-5">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary-400 mb-1">
            <Building2 className="w-4 h-4" />
            <span className="text-sm font-medium">Organization Profile</span>
          </div>
          <Input label="Organization Name" placeholder="e.g. National Institute of Technology"
            {...register("name")} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Description</label>
            <textarea rows={3} placeholder="Brief description..."
              className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
              {...register("description")} />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary-400 mb-1">
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Election Defaults</span>
          </div>
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Require biometric verification</p>
              <p className="text-xs text-gray-500">Voters must use fingerprint to cast votes</p>
            </div>
            <input type="checkbox" className="w-4 h-4 accent-primary-500" />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Anonymous voting by default</p>
              <p className="text-xs text-gray-500">New elections default to anonymous mode</p>
            </div>
            <input type="checkbox" className="w-4 h-4 accent-primary-500" />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Auto-publish results</p>
              <p className="text-xs text-gray-500">Publish results automatically when election ends</p>
            </div>
            <input type="checkbox" className="w-4 h-4 accent-primary-500" />
          </label>
        </Card>

        <Button type="submit" loading={saving} className="w-full" size="lg">
          <Save className="w-4 h-4" /> Save Settings
        </Button>
      </form>
    </div>
  );
}
