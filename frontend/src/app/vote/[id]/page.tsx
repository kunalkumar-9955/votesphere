"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { electionApi, biometricApi } from "@/lib/api";
import { isBiometricAvailable, authenticateBiometric } from "@/lib/webauthn";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { FingerprintScanner, ScanState } from "@/components/biometric/FingerprintScanner";
import {
  Vote, CheckCircle, Shield, Clock, ArrowLeft, Sparkles,
  Users, Lock, Fingerprint, AlertTriangle, Copy
} from "lucide-react";
import { formatDateTime, getElectionTypeLabel } from "@/lib/utils";
import Link from "next/link";

type VoteStep = "select" | "biometric" | "confirm" | "success";

function CountdownTimer({ endTime }: { endTime: string }) {
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Ended"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h}h ${m}m ${s}s`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endTime]);
  return <span className="font-mono text-orange-400">{remaining}</span>;
}

export default function VotePage() {
  const { id } = useParams();
  const router = useRouter();
  const [election, setElection] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<VoteStep>("select");
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [biometricVerified, setBiometricVerified] = useState(false);
  const [biometricCredentialId, setBiometricCredentialId] = useState<string | null>(null);
  const [hasBiometric, setHasBiometric] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      electionApi.get(Number(id)),
      electionApi.getCandidates(Number(id)),
      isBiometricAvailable(),
    ]).then(([e, c, bio]) => {
      setElection(e.data);
      setCandidates(c.data);
      setHasBiometric(bio);
    }).catch(() => toast.error("Failed to load election"))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleCandidate = (cid: number) => {
    if (election?.allow_multiple_choice) {
      setSelected((prev) =>
        prev.includes(cid)
          ? prev.filter((x) => x !== cid)
          : prev.length < (election.max_choices || 1) ? [...prev, cid] : prev
      );
    } else {
      setSelected([cid]);
    }
  };

  const handleBiometricAuth = async () => {
    setScanState("scanning");
    try {
      const challengeRes = await biometricApi.getAuthChallenge();
      const result = await authenticateBiometric(challengeRes.data);
      await biometricApi.verifyAuthentication(result);
      setScanState("success");
      setBiometricVerified(true);
      setBiometricCredentialId(result.credential_id);
      toast.success("Identity verified!");
      setTimeout(() => setStep("confirm"), 1000);
    } catch (err: any) {
      setScanState("error");
      const msg = err?.response?.data?.detail || err?.message || "Biometric verification failed";
      toast.error(msg);
      setTimeout(() => setScanState("idle"), 2500);
    }
  };

  const skipBiometric = () => {
    setBiometricVerified(false);
    setStep("confirm");
  };

  const submitVote = async () => {
    setSubmitting(true);
    try {
      const res = await electionApi.vote({
        election_id: Number(id),
        candidate_ids: selected,
        biometric_verified: biometricVerified,
        biometric_credential_id: biometricCredentialId,
      });
      setReceipt(res.data.receipt_code);
      setStep("success");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to cast vote");
      setStep("select");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );

  const selectedCandidate = candidates.find((c) => c.id === selected[0]);
  const CANDIDATE_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
          animate={{ width: step === "select" ? "25%" : step === "biometric" ? "60%" : step === "confirm" ? "85%" : "100%" }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 pt-10 space-y-5">
        {/* Back */}
        {step !== "success" && (
          <button onClick={() => step === "select" ? router.back() : setStep(step === "biometric" ? "select" : "biometric")}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {step === "select" ? "Back to Dashboard" : "Previous step"}
          </button>
        )}

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Select Candidate ── */}
          {step === "select" && (
            <motion.div key="select" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} className="space-y-5">
              {/* Election header */}
              <Card className="p-5 border-primary-500/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <Vote className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <h1 className="text-lg font-bold text-white">{election?.title}</h1>
                      <StatusBadge status={election?.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-gray-500">
                      <span>{getElectionTypeLabel(election?.type)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-orange-400" />
                        <CountdownTimer endTime={election?.end_time} />
                      </span>
                      <span>·</span>
                      <span>{candidates.length} candidates</span>
                      {election?.is_anonymous && (
                        <span className="text-green-400 flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Anonymous
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              <p className="text-sm text-gray-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-400" />
                {election?.allow_multiple_choice
                  ? `Select up to ${election.max_choices} candidates`
                  : "Select one candidate"}
              </p>

              {/* Candidates */}
              <div className="space-y-3">
                {candidates.map((c, i) => {
                  const isSelected = selected.includes(c.id);
                  return (
                    <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }} onClick={() => toggleCandidate(c.id)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 select-none
                        ${isSelected
                          ? "border-primary-500/60 bg-gradient-to-r from-primary-500/10 to-accent-500/5 shadow-lg shadow-primary-500/10"
                          : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5"}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0 transition-all`}
                          style={{
                            background: isSelected
                              ? `linear-gradient(135deg, ${CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]}, ${CANDIDATE_COLORS[(i + 1) % CANDIDATE_COLORS.length]})`
                              : "rgba(255,255,255,0.05)",
                            color: isSelected ? "white" : "#6b7280",
                          }}>
                          {c.name[0]}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{c.name}</h3>
                          {(c.party || c.position) && (
                            <p className={`text-sm mt-0.5 ${isSelected ? "text-primary-300" : "text-gray-400"}`}>
                              {c.party || c.position}
                            </p>
                          )}
                          {c.bio && <p className="text-gray-500 text-xs mt-1 line-clamp-1">{c.bio}</p>}
                        </div>
                        <motion.div animate={{ scale: isSelected ? 1 : 0.8 }}
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                            ${isSelected ? "border-primary-500 bg-primary-500" : "border-gray-600"}`}>
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <Button onClick={() => setStep("biometric")} disabled={selected.length === 0}
                className="w-full" size="lg">
                Continue to Verification
                <Fingerprint className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* ── STEP 2: Biometric Verification ── */}
          {step === "biometric" && (
            <motion.div key="biometric" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <Card className="p-8">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-white">Identity Verification</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Verify your identity before casting your vote
                  </p>
                </div>

                <div className="flex flex-col items-center gap-6">
                  <FingerprintScanner
                    state={hasBiometric === false ? "unsupported" : scanState}
                    size="lg"
                    onScan={handleBiometricAuth}
                  />

                  {hasBiometric && (
                    <Button onClick={handleBiometricAuth} loading={scanState === "scanning"}
                      disabled={scanState === "scanning" || scanState === "success"}
                      className="w-full" size="lg">
                      <Fingerprint className="w-4 h-4" />
                      Authenticate with Fingerprint
                    </Button>
                  )}

                  <div className="w-full border-t border-white/5 pt-4 text-center">
                    <p className="text-xs text-gray-500 mb-3">
                      {hasBiometric
                        ? "Don't have a fingerprint device enrolled?"
                        : "Biometrics not available on this device"}
                    </p>
                    <Button variant="ghost" size="sm" onClick={skipBiometric}>
                      <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                      Skip biometric (less secure)
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Selected candidate preview */}
              {selectedCandidate && (
                <Card className="p-4 border-primary-500/20">
                  <p className="text-xs text-gray-500 mb-2">Voting for</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-lg font-bold text-primary-400">
                      {selectedCandidate.name[0]}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{selectedCandidate.name}</p>
                      <p className="text-gray-500 text-xs">{selectedCandidate.party || selectedCandidate.position}</p>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          )}

          {/* ── STEP 3: Final Confirmation ── */}
          {step === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }} className="space-y-5">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 text-center">Confirm Your Vote</h2>

                {/* Verification status */}
                <div className={`flex items-center gap-3 p-3 rounded-xl mb-5 ${biometricVerified
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-yellow-500/10 border border-yellow-500/20"}`}>
                  {biometricVerified
                    ? <><CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <div>
                          <p className="text-green-300 text-sm font-medium">Biometric verified</p>
                          <p className="text-green-500/70 text-xs">Your identity has been confirmed</p>
                        </div></>
                    : <><AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                        <div>
                          <p className="text-yellow-300 text-sm font-medium">Biometric skipped</p>
                          <p className="text-yellow-500/70 text-xs">Vote will be recorded without biometric verification</p>
                        </div></>}
                </div>

                {/* Candidate summary */}
                <div className="space-y-2 mb-6">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Your selection</p>
                  {selected.map((cid) => {
                    const c = candidates.find((x) => x.id === cid);
                    return c ? (
                      <div key={cid} className="flex items-center gap-3 p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-lg font-bold text-primary-400">
                          {c.name[0]}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{c.name}</p>
                          <p className="text-gray-400 text-xs">{c.party || c.position || "Independent"}</p>
                        </div>
                        <CheckCircle className="w-4 h-4 text-primary-400 ml-auto" />
                      </div>
                    ) : null;
                  })}
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep("biometric")} className="flex-1">
                    Go Back
                  </Button>
                  <Button onClick={submitVote} loading={submitting} className="flex-[2]">
                    <Lock className="w-4 h-4" />
                    Submit Vote Securely
                  </Button>
                </div>

                <p className="text-center text-xs text-gray-700 mt-4">
                  <Lock className="w-3 h-3 inline mr-1" />
                  This action is irreversible. Your vote is encrypted end-to-end.
                </p>
              </Card>
            </motion.div>
          )}

          {/* ── STEP 4: Success ── */}
          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }} className="space-y-5">
              <Card className="p-8 text-center border-green-500/20">
                {/* Animated success */}
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-28 h-28 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6 relative">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: 3, duration: 0.5, delay: 0.5 }}>
                    <CheckCircle className="w-14 h-14 text-green-400" />
                  </motion.div>
                  {biometricVerified && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }}
                      className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-primary-500 border-2 border-gray-950 flex items-center justify-center">
                      <Fingerprint className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <h2 className="text-2xl font-bold text-white mb-1">Vote Cast!</h2>
                  <p className="text-gray-400 text-sm mb-2">
                    Your vote has been securely recorded
                    {biometricVerified && " with biometric verification"}.
                  </p>

                  {biometricVerified && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs mb-5">
                      <Fingerprint className="w-3 h-3" /> Biometrically verified
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-primary-400" />
                      <p className="text-xs text-gray-400 font-medium">Secure Vote Receipt</p>
                    </div>
                    <p className="text-xs font-mono text-primary-400 break-all leading-relaxed">{receipt}</p>
                    <p className="text-xs text-gray-600 mt-2">Save this to verify your vote was counted.</p>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => router.push("/dashboard/voter")} className="flex-1">
                      Dashboard
                    </Button>
                    <Button onClick={() => { navigator.clipboard.writeText(receipt || ""); toast.success("Copied!"); }} className="flex-1">
                      <Copy className="w-4 h-4" /> Copy Receipt
                    </Button>
                  </div>
                </motion.div>
              </Card>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
