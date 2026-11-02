import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500",
            "px-4 py-3 text-sm transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50",
            "hover:border-white/20",
            icon && "pl-10",
            error && "border-red-500/50 focus:ring-red-500/30",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <select
        ref={ref}
        className={cn(
          "w-full rounded-xl bg-gray-900 border border-white/10 text-white",
          "px-4 py-3 text-sm transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50",
          error && "border-red-500/50",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
);
Select.displayName = "Select";
