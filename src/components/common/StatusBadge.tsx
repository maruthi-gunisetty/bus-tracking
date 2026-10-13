import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Clock, Info } from 'lucide-react';

export type StatusVariant = 'ok' | 'warning' | 'error' | 'info' | 'stale';

interface StatusBadgeProps {
  variant: StatusVariant;
  text: string;
  pulse?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  text,
  pulse = false,
  className = '',
}) => {
  const configs = {
    ok: {
      bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
      icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />,
      dot: 'bg-emerald-400',
    },
    warning: {
      bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
      icon: <AlertTriangle className="w-3.5 h-3.5 mr-1.5 shrink-0" />,
      dot: 'bg-amber-400',
    },
    error: {
      bg: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
      icon: <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />,
      dot: 'bg-rose-400',
    },
    info: {
      bg: 'bg-sky-500/15 border-sky-500/40 text-sky-400',
      icon: <Info className="w-3.5 h-3.5 mr-1.5 shrink-0" />,
      dot: 'bg-sky-400',
    },
    stale: {
      bg: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
      icon: <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" />,
      dot: 'bg-amber-300',
    },
  };

  const current = configs[variant];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${current.bg} ${
        pulse ? 'animate-pulse' : ''
      } ${className}`}
    >
      {current.icon}
      <span>{text}</span>
    </span>
  );
};
