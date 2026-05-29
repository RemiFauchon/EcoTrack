import { ContainerStatus } from '../types';

const META: Record<ContainerStatus, { label: string; color: string; bg: string; icon: string }> = {
  OK: { label: 'OK', color: '#1f9d57', bg: 'rgba(31,157,87,0.12)', icon: '●' },
  WARNING: { label: 'À collecter', color: '#b06a00', bg: 'rgba(224,135,0,0.14)', icon: '▲' },
  CRITICAL: { label: 'Critique', color: '#c23a31', bg: 'rgba(214,69,61,0.14)', icon: '■' },
  UNKNOWN: { label: 'Inconnu', color: '#6b7280', bg: 'rgba(154,163,157,0.16)', icon: '○' },
};

export function statusColor(s: ContainerStatus) {
  return META[s].color;
}

export default function StatusPill({ status }: { status: ContainerStatus }) {
  const m = META[status];
  return (
    <span className="pill" style={{ color: m.color, background: m.bg }}>
      <span aria-hidden>{m.icon}</span>
      {m.label}
    </span>
  );
}
