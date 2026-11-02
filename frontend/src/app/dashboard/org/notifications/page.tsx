"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Bell, Vote, Users, Trophy, AlertTriangle, CheckCircle } from "lucide-react";

const MOCK_NOTIFICATIONS = [
  { id: 1, type: "election", icon: Vote, title: "Election Started", message: "Student Council President Election 2024 is now active.", time: "2 hours ago", read: false, color: "text-primary-400 bg-primary-500/10" },
  { id: 2, type: "member", icon: Users, title: "New Member Joined", message: "Student5 joined your organization via invite code.", time: "5 hours ago", read: false, color: "text-blue-400 bg-blue-500/10" },
  { id: 3, type: "result", icon: Trophy, title: "Results Published", message: "Best Canteen Food Poll results are now available.", time: "1 day ago", read: true, color: "text-yellow-400 bg-yellow-500/10" },
  { id: 4, type: "alert", icon: AlertTriangle, title: "Fraud Alert", message: "Suspicious voting pattern detected in Election #1.", time: "2 days ago", read: true, color: "text-red-400 bg-red-500/10" },
  { id: 5, type: "success", icon: CheckCircle, title: "Organization Approved", message: "Your organization has been approved by the platform admin.", time: "3 days ago", read: true, color: "text-green-400 bg-green-500/10" },
];

export default function OrgNotificationsPage() {
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-gray-400 text-sm mt-1">{unread} unread notifications</p>
        </div>
        {unread > 0 && (
          <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {MOCK_NOTIFICATIONS.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className={`p-4 transition-colors ${!n.read ? "border-primary-500/20 bg-primary-500/3" : "hover:border-white/15"}`}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.color}`}>
                  <n.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white text-sm font-medium">{n.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary-400" />}
                      <span className="text-xs text-gray-500">{n.time}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
