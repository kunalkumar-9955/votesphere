import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    active: "text-green-400 bg-green-400/10 border-green-400/20",
    ended: "text-gray-400 bg-gray-400/10 border-gray-400/20",
    draft: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    scheduled: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    paused: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    result_published: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    approved: "text-green-400 bg-green-400/10 border-green-400/20",
    pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    suspended: "text-red-400 bg-red-400/10 border-red-400/20",
    rejected: "text-red-400 bg-red-400/10 border-red-400/20",
  };
  return map[status] || "text-gray-400 bg-gray-400/10 border-gray-400/20";
}

export function getElectionTypeLabel(type: string) {
  const map: Record<string, string> = {
    college: "College Election",
    club: "Club Election",
    society: "Society Voting",
    polling: "Poll",
    event: "Event Decision",
    real_simulation: "Real Election Simulation",
    corporate: "Corporate Voting",
    school: "School Election",
    contest: "Contest",
    ngo: "NGO Election",
  };
  return map[type] || type;
}
