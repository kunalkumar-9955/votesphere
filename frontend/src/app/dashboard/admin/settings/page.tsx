"use client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Settings, Shield, Bell, Database } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure global platform behavior</p>
      </div>

      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2 text-primary-400 mb-1">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">Security Settings</span>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Require OTP for all logins</p>
              <p className="text-xs text-gray-500">Send OTP on every login attempt</p>
            </div>
            <input type="checkbox" className="w-4 h-4 accent-primary-500" defaultChecked />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Auto-suspend flagged users</p>
              <p className="text-xs text-gray-500">Suspend users with fraud score above 0.8</p>
            </div>
            <input type="checkbox" className="w-4 h-4 accent-primary-500" />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Require org approval</p>
              <p className="text-xs text-gray-500">New organizations need admin approval</p>
            </div>
            <input type="checkbox" className="w-4 h-4 accent-primary-500" defaultChecked />
          </label>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-primary-400 mb-1">
          <Bell className="w-4 h-4" />
          <span className="text-sm font-medium">Notification Settings</span>
        </div>
        <label className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Email notifications</p>
            <p className="text-xs text-gray-500">Send email alerts for important events</p>
          </div>
          <input type="checkbox" className="w-4 h-4 accent-primary-500" defaultChecked />
        </label>
        <label className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Fraud alerts</p>
            <p className="text-xs text-gray-500">Notify admin on high fraud score detections</p>
          </div>
          <input type="checkbox" className="w-4 h-4 accent-primary-500" defaultChecked />
        </label>
      </Card>

      <Button onClick={() => toast.success("Settings saved!")} className="w-full">
        Save Settings
      </Button>
    </div>
  );
}
