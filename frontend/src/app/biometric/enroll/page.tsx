"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Shield, Smartphone, CheckCircle, ArrowRight, Info, Trash2, Plus } from "lucide-react";
import { FingerprintScanner, ScanState } from "@/components/biometric/FingerprintScanner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { biometricApi } from "@/lib/api";
import { isWebAuthnSupported, isBiometricAvailable, registerBiometric } from "@/lib/webauthn";
import { useAuthStore } from "@/store/authStore";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

export default function BiometricEnrollPage() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [deviceName, setDeviceName] = useState("");
  const [supported, setSupported] = useState<boolean | null>(null);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    isBiometricAvailable().then(setSupported);
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      const r = await biometricApi.listCredentials();
      setCredentials(r.data);
    } catch {}
  };

  const handleEnroll = async () => {
    if (!deviceName.trim()) { toast.error("Enter a device name"); return; }
    setScanState("scanning");
    setLoading(true);
    try {
      // Step 1: Get challenge from server
      const challengeRes = await biometricApi.getRegisterChallenge();
      const challenge = challengeRes.data;

      // Step 2: Call WebAuthn API
      const credData = await registerBiometric(challenge);

      // Step 3: Verify with server
      await biometricApi.verifyRegistration({
        ...credData,
        device_name: deviceName,
      });

      setScanState("success");
      toast.success("Fingerprint enrolled successfully!");
      await loadCredentials();
      setDeviceName("");
      setTimeout(() => setScanState("idle"), 2000);
    } catch (err: any) {
      setScanState("error");
      const msg = err?.response?.data?.detail || err?.message || "Enrollment failed";
      toast.error(msg);
      setTimeout(() => setScanState("idle"), 2500);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await biometricApi.deleteCredential(id);
      toast.success("Device removed");
      loadCredentials();
    } catch {
      toast.error("Failed to remove device");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 flex items-center justify-center">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs mb-4">
            <Shield className="w-3.5 h-3.5" /> Biometric Security
          </div>
          <h1 className="text-2xl font-bold text-white">Fingerprint Enrollment</h1>
          <p className="text-gray-400 text-sm mt-1.5">Register your device for secure biometric voting</p>
        </motion.div>

        {/* Support check */}
        {supported === false && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-300 text-sm font-medium">Biometrics not available</p>
              <p className="text-yellow-500/80 text-xs mt-1">
                Your device or browser doesn't support biometric authentication.
                Use Chrome/Edge on Windows Hello, Touch ID on Mac, or a fingerprint-enabled Android device.
              </p>
            </div>
          </motion.div>
        )}

        {/* Enrollment card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-8">
            <div className="flex flex-col items-center gap-6">
              <FingerprintScanner
                state={supported === false ? "unsupported" : scanState}
                size="lg"
                onScan={handleEnroll}
              />

              <div className="w-full space-y-3">
                <Input
                  label="Device Name"
                  placeholder="e.g. My Laptop, iPhone 15"
                  icon={<Smartphone className="w-4 h-4" />}
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  disabled={loading || supported === false}
                />
                <Button
                  onClick={handleEnroll}
                  loading={loading}
                  disabled={supported === false || !deviceName.trim()}
                  className="w-full"
                  size="lg"
                >
                  <Plus className="w-4 h-4" />
                  Enroll Fingerprint
                </Button>
              </div>

              <p className="text-xs text-gray-600 text-center">
                Your biometric data never leaves your device. Only a cryptographic key is stored.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Registered devices */}
        {credentials.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary-400" />
                Registered Devices ({credentials.length}/5)
              </h3>
              <div className="space-y-3">
                {credentials.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/8">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary-500/20 flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-primary-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{c.device_name}</p>
                        <p className="text-gray-500 text-xs">
                          {c.last_used ? `Last used ${formatDateTime(c.last_used)}` : "Never used"}
                          {" · "}{c.sign_count} authentications
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <button onClick={() => handleDelete(c.id)}
                        disabled={deleting === c.id}
                        className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        <div className="flex gap-3">
          <Link href="/dashboard/voter" className="flex-1">
            <Button variant="ghost" className="w-full">Skip for now</Button>
          </Link>
          {credentials.length > 0 && (
            <Link href="/dashboard/voter" className="flex-1">
              <Button className="w-full">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
