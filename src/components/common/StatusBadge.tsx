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
      bg: 'bg-status-success/10 text-status-success border border-status-success/20',
      icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 shrink-0" strokeWidth={2} />,
    },
    warning: {
      bg: 'bg-status-warning/10 text-status-warning border border-status-warning/20',
      icon: <AlertTriangle className="w-3.5 h-3.5 mr-1.5 shrink-0" strokeWidth={2} />,
    },
    error: {
      bg: 'bg-status-error/10 text-status-error border border-status-error/20',
      icon: <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" strokeWidth={2} />,
    },
    info: {
      bg: 'bg-status-info/10 text-status-info border border-status-info/20',
      icon: <Info className="w-3.5 h-3.5 mr-1.5 shrink-0" strokeWidth={2} />,
    },
    stale: {
      bg: 'bg-slate-100 text-slate-600 border border-slate-200',
      icon: <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" strokeWidth={2} />,
    },
  };

  const current = configs[variant];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold tracking-tight ${current.bg} ${
        pulse ? 'animate-pulse' : ''
      } ${className}`}
    >
      {current.icon}
      <span>{text}</span>
    </span>
  );
};
