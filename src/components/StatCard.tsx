import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number;
  helper: string;
  tone: "primary" | "success" | "danger" | "warning";
  icon: ReactNode;
}

export function StatCard({
  label,
  value,
  helper,
  tone,
  icon,
}: StatCardProps) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__icon">{icon}</div>

      <div className="stat-card__content">
        <div className="stat-card__label">{label}</div>
        <strong className="stat-card__value">
          {value.toLocaleString()}
        </strong>
        <div className="stat-card__helper">{helper}</div>
      </div>
    </article>
  );
}
