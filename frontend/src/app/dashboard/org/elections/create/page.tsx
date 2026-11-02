"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { electionApi, orgApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Vote, Calendar, Settings } from "lucide-react";

const schema = z.object({
  title: z.string().min(3, "Title too short"),
  description: z.string().optional(),
  type: z.string().min(1, "Select type"),
  organization_id: z.number({ coerce: true }).min(1, "Select organization"),
  start_time: z.string().min(1, "Required"),
  end_time: z.string().min(1, "Required"),
  is_anonymous: z.boolean().default(false),
  allow_multiple_choice: z.boolean().default(false),
  max_choices: z.number({ coerce: true }).default(1),
});

type FormData = z.infer<typeof schema>;

const ELECTION_TYPES = [
  { value: "college", label: "College Election" },
  { value: "club", label: "Club Election" },
  { value: "society", label: "Society Voting" },
  { value: "polling", label: "Polling" },
  { value: "event", label: "Event Decision" },
  { value: "real_simulation", label: "Real Election Simulation" },
  { value: "corporate", label: "Corporate Voting" },
  { value: "school", label: "School Election" },
  { value: "contest", label: "Contest Voting" },
  { value: "ngo", label: "NGO Election" },
];

export default function CreateElectionPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_anonymous: false, allow_multiple_choice: false, max_choices: 1 },
  });

  useEffect(() => {
    orgApi.list().then((r) => setOrgs(r.data.filter((o: any) => o.status === "approved")));
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        start_time: new Date(data.start_time).toISOString(),
        end_time: new Date(data.end_time).toISOString(),
      };
      const res = await electionApi.create(payload);
      toast.success("Election created!");
      router.push(`/dashboard/org/elections/${res.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create election");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Create Election</h1>
        <p className="text-gray-400 text-sm mt-1">Set up a new election for your organization</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2 text-primary-400 mb-2">
            <Vote className="w-4 h-4" />
            <span className="text-sm font-medium">Basic Information</span>
          </div>

          <Input label="Election Title" placeholder="e.g. Student Council President 2024"
            error={errors.title?.message} {...register("title")} />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Description</label>
            <textarea
              placeholder="Brief description of this election..."
              rows={3}
              className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
              {...register("description")}
            />
          </div>

          <Select label="Election Type" error={errors.type?.message} {...register("type")}>
            <option value="">Select type...</option>
            {ELECTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>

          <Select label="Organization" error={errors.organization_id?.message} {...register("organization_id")}>
            <option value="">Select organization...</option>
            {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </Select>
        </Card>

        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2 text-primary-400 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Schedule</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time" type="datetime-local" error={errors.start_time?.message} {...register("start_time")} />
            <Input label="End Time" type="datetime-local" error={errors.end_time?.message} {...register("end_time")} />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary-400 mb-2">
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Settings</span>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded accent-primary-500" {...register("is_anonymous")} />
            <div>
              <span className="text-sm text-white">Anonymous Voting</span>
              <p className="text-xs text-gray-500">Votes won't be linked to voter identity</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded accent-primary-500" {...register("allow_multiple_choice")} />
            <div>
              <span className="text-sm text-white">Multiple Choice</span>
              <p className="text-xs text-gray-500">Allow voters to select multiple candidates</p>
            </div>
          </label>
          {watch("allow_multiple_choice") && (
            <Input label="Max Choices" type="number" min={2} max={10} {...register("max_choices")} />
          )}
        </Card>

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Create Election
        </Button>
      </form>
    </div>
  );
}
