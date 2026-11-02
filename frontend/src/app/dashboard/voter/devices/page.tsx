"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import { Smartphone, Plus, Trash2, CheckCircle, Shield, Fingerprint, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { biometricApi } from "@/lib/api";
import { isBiometricAvailable } from "@/lib/webauthn";
import { formatDateTime } from "@/lib/utils";

export default function DeviceManagerPage() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    isBiometricAvailable().then(setSupported);
    biometricApi.listCredentials()
      .then((r) => setCredentials(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await biometricApi.deleteCredential(id);
      toast.success("Device removed");
      setCredentials((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error("Failed to remove device");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Biometric Devices</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your fingerprint-enabled devices</p>
        </div>
        <Link href="/biometric/enroll">
          <Button size="sm"><Plus className="w-4 h-4" /> Add Device</Button>
        </Link>
      </div>

      {/* Support banner */}
      {supported === false && (
        <Card className="p-4 border-yellow-500/20 bg-yellow-500/5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-300 text-sm font-medium">Biometrics not supported</p>
              <p className="text-yellow-500/70 text-xs mt-1">
                Use Chrome/Edge on Windows Hello, Touch ID on Mac, or fingerprint-enabled Android.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Security info */}
      <Card className="p-5 border-primary-500/20 bg-gradient-to-r from-primary-500/5 to-accent-500/5">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-semibold">How biometric voting works</p>
            <p className="text-gray-400 text-xs mt-1 leading-relaxed">
              Before casting a vote, you'll be asked to verify your identity using your device's
              fingerprint sensor. Your biometric data never leaves your device — only a
              cryptographic key is stored on our servers.
            </p>
          </div>
        </div>
      </Card>

      {/* Devices list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : credentials.length > 0 ? (
        <div className="space-y-3">
          {credentials.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}>
              <Card className="p-4 border-green-500/10 hover:border-green-500/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/20 flex items-center justify-center">
                      <Fingerprint className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium text-sm">{c.device_name}</p>
                        <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {c.sign_count} authentications ·{" "}
                        {c.last_used ? `Last: ${formatDateTime(c.last_used)}` : "Never used"}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="danger" loading={deleting === c.id}
                    onClick={() => handleDelete(c.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-4">
            <Fingerprint className="w-10 h-10 text-primary-400/50" />
          </div>
          <p className="text-gray-400 text-sm font-medium">No devices enrolled</p>
          <p className="text-gray-600 text-xs mt-1 mb-4">Add a fingerprint device to enable biometric voting</p>
          <Link href="/biometric/enroll">
            <Button size="sm"><Plus className="w-4 h-4" /> Enroll Device</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
