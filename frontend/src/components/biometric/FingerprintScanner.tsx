"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, CheckCircle, XCircle, Loader2, Shield } from "lucide-react";

export type ScanState = "idle" | "scanning" | "success" | "error" | "unsupported";

interface FingerprintScannerProps {
  state: ScanState;
  message?: string;
  size?: "sm" | "md" | "lg";
  onScan?: () => void;
}

const sizeMap = {
  sm: { outer: "w-24 h-24", icon: "w-10 h-10", ring1: "w-32 h-32", ring2: "w-40 h-40" },
  md: { outer: "w-36 h-36", icon: "w-16 h-16", ring1: "w-48 h-48", ring2: "w-60 h-60" },
  lg: { outer: "w-48 h-48", icon: "w-24 h-24", ring1: "w-64 h-64", ring2: "w-80 h-80" },
};

const stateConfig = {
  idle: {
    bg: "from-primary-500/20 to-accent-500/20",
    border: "border-primary-500/40",
    iconColor: "text-primary-400",
    ringColor: "border-primary-500/20",
    label: "Touch to authenticate",
  },
  scanning: {
    bg: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-400/60",
    iconColor: "text-blue-400",
    ringColor: "border-blue-400/30",
    label: "Scanning fingerprint...",
  },
  success: {
    bg: "from-green-500/20 to-emerald-500/20",
    border: "border-green-400/60",
    iconColor: "text-green-400",
    ringColor: "border-green-400/30",
    label: "Identity verified",
  },
  error: {
    bg: "from-red-500/20 to-rose-500/20",
    border: "border-red-400/60",
    iconColor: "text-red-400",
    ringColor: "border-red-400/30",
    label: "Verification failed",
  },
  unsupported: {
    bg: "from-gray-500/20 to-gray-600/20",
    border: "border-gray-500/40",
    iconColor: "text-gray-500",
    ringColor: "border-gray-500/20",
    label: "Biometrics not available",
  },
};

export function FingerprintScanner({
  state,
  message,
  size = "md",
  onScan,
}: FingerprintScannerProps) {
  const s = sizeMap[size];
  const cfg = stateConfig[state];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Scanner rings */}
      <div className="relative flex items-center justify-center">
        {/* Outer pulse rings */}
        {state === "scanning" && (
          <>
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className={`absolute ${s.ring2} rounded-full border ${cfg.ringColor}`}
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.3, ease: "easeInOut" }}
              className={`absolute ${s.ring1} rounded-full border ${cfg.ringColor}`}
            />
          </>
        )}

        {/* Success ripple */}
        {state === "success" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={`absolute ${s.ring1} rounded-full border-2 border-green-400/50`}
          />
        )}

        {/* Main scanner button */}
        <motion.button
          onClick={state === "idle" || state === "error" ? onScan : undefined}
          whileHover={state === "idle" ? { scale: 1.05 } : undefined}
          whileTap={state === "idle" ? { scale: 0.95 } : undefined}
          animate={state === "scanning" ? { scale: [1, 1.02, 1] } : { scale: 1 }}
          transition={state === "scanning" ? { repeat: Infinity, duration: 1.5 } : {}}
          className={`relative ${s.outer} rounded-full bg-gradient-to-br ${cfg.bg}
            border-2 ${cfg.border} flex items-center justify-center
            ${state === "idle" || state === "error" ? "cursor-pointer" : "cursor-default"}
            transition-all duration-300 shadow-2xl`}
        >
          {/* Scan line animation */}
          {state === "scanning" && (
            <motion.div
              animate={{ y: ["-40%", "40%", "-40%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"
            />
          )}

          <AnimatePresence mode="wait">
            {state === "success" ? (
              <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}>
                <CheckCircle className={`${s.icon} text-green-400`} />
              </motion.div>
            ) : state === "error" ? (
              <motion.div key="error" initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}>
                <XCircle className={`${s.icon} text-red-400`} />
              </motion.div>
            ) : state === "scanning" ? (
              <motion.div key="scanning" animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}>
                <Fingerprint className={`${s.icon} ${cfg.iconColor}`} />
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Fingerprint className={`${s.icon} ${cfg.iconColor}`} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Status label */}
      <AnimatePresence mode="wait">
        <motion.div key={state} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} className="text-center">
          <p className={`text-sm font-medium ${cfg.iconColor}`}>{message || cfg.label}</p>
          {state === "scanning" && (
            <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Processing biometric data...
            </p>
          )}
          {state === "idle" && (
            <p className="text-xs text-gray-600 mt-1">
              Uses your device's built-in biometric sensor
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
