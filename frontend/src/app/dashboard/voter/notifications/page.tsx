"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Bell, Vote, CheckCircle, Trophy, Fingerprint } from "lucide-react";

const MOCK = [
  { id: 1, icon: Vote, title: "New Election Available", message: "Student Council President Election 2024 is now open for voting.", time: "2 hours ago", read: false, color: "text-primary-400 bg-primary-500/10" },
  { id: 2, icon: Fingerprint, title: "Biometric Enrolled", message: "Your fingerprint device was successfully registered.", time: "1 day ago", read: false, color: "text-green-400 bg-green-500/10" },
  { id: 3, icon: CheckCircle, title: "Vote Confirmed", message: "Your vote in Best Canteen Food Poll was recorded successfully.", time: "2 days ago", read: true, color: "text-blue-400 bg-blue-500/10" },
  { id: 4, icon: Trophy, title: "Results Published", message: "Results for Best Canteen Food Poll are now available.", time: "3 days ago", read: true, color: "text-yellow-400 bg-yellow-500/10" },
];

export default function VoterNotificationsPage() {
  const unread = MOCK.filter((n) => !n.read).length;
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-gray-400 text-sm mt-1">{unread} unread</p>
      </div>
      <div className="space-y-3">
        {MOCK.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className={`p-4 ${!n.read ? "border-primary-500/20 bg-primary-500/3" : "hover:border-white/15"} transition-colors`}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.color}`}>
                  <n.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white text-sm font-medium">{n.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary-400" />}
                      <span className="text-xs text-gray-500">{n.time}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">{n.message}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
