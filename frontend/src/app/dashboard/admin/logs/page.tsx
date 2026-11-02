"use client";
import { useEffect, useState } from "react";
import { analyticsApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { FileText } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.auditLogs().then((r) => setLogs(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <p className="text-gray-400 text-sm mt-1">Complete activity trail</p>
      </div>

      <div className="space-y-2">
        {logs.map((l) => (
          <Card key={l.id} className="p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-gray-300 capitalize">{l.action?.replace(/_/g, " ")}</span>
                {l.resource_type && <span className="text-gray-500 text-xs">on {l.resource_type} #{l.resource_id}</span>}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {l.ip_address && <span>{l.ip_address}</span>}
                <span>{formatDateTime(l.created_at)}</span>
              </div>
            </div>
          </Card>
        ))}
        {logs.length === 0 && <div className="text-center py-16 text-gray-500">No logs yet</div>}
      </div>
    </div>
  );
}
