import { useEffect, useState } from 'react';
import { api } from '../api';
import { getSocket } from '../socket';
import { useAuth } from '../auth';
import ContainerMap from '../components/ContainerMap';
import { Alert, CollectionRoute, Container, MonthlyReport, Overview } from '../types';

const MONTH_NOW = new Date().toISOString().slice(0, 7);

function openReportPdf(r: MonthlyReport) {
  const rows: [string, string | number][] = [
    ['Tournées planifiées', r.routesPlanned],
    ['Tournées terminées', r.routesCompleted],
    ['Conteneurs collectés', r.stopsCollected],
    ['Distance parcourue', `${r.distanceKm} km`],
    ['Alertes levées', r.alertsRaised],
    ['Signalements citoyens', r.signalements],
    ['Mesures IoT enregistrées', r.measurements],
  ];
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Rapport ${r.period}</title>
  <style>
    body{font-family:Georgia,serif;color:#0e1f17;max-width:720px;margin:40px auto;padding:0 24px}
    h1{font-size:26px;margin:0} .sub{color:#168650;font-weight:bold;text-transform:uppercase;letter-spacing:2px;font-size:12px}
    table{width:100%;border-collapse:collapse;margin-top:24px} td{padding:12px 8px;border-bottom:1px solid #e5e5e0}
    td:last-child{text-align:right;font-weight:bold;font-size:18px}
    .head{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #0e1f17;padding-bottom:12px}
    .foot{margin-top:32px;color:#888;font-size:11px}
  </style></head><body>
    <div class="head"><div><div class="sub">ECOTRACK · Lyon Métropole</div><h1>Rapport mensuel</h1></div>
    <div style="text-align:right"><div style="font-size:20px;font-weight:bold;text-transform:capitalize">${r.period}</div>
    <div style="color:#888;font-size:12px">${r.from} → ${r.to}</div></div></div>
    <table>${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
    <p class="foot">Document généré le ${new Date().toLocaleString('fr-FR')} — plateforme ECOTRACK.</p>
    <script>window.onload=()=>window.print()</script>
  </body></html>`;
  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

function Kpi({ label, value, accent, hint }: { label: string; value: number | string; accent?: string; hint?: string }) {
  return (
    <div className="card p-4 animate-rise">
      <div className="label">{label}</div>
      <div className="mt-1 text-3xl font-display font-extrabold" style={{ color: accent ?? '#0e1f17' }}>
        {value}
      </div>
      {hint && <div className="text-[11px] text-ink/45 mt-0.5">{hint}</div>}
    </div>
  );
}

const LEGEND = [
  { c: '#1f9d57', l: 'OK' },
  { c: '#e08700', l: 'À collecter' },
  { c: '#d6453d', l: 'Critique' },
];

export default function Dashboard() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [route, setRoute] = useState<CollectionRoute | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [minFill, setMinFill] = useState(70);
  const [month, setMonth] = useState(MONTH_NOW);
  const { user } = useAuth();
  const [mfaQr, setMfaQr] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaDone, setMfaDone] = useState(false);

  async function downloadReport() {
    const { data } = await api.get<MonthlyReport>('/reports/monthly', { params: { month } });
    openReportPdf(data);
  }

  async function startMfa() {
    const { data } = await api.post('/auth/mfa/setup');
    setMfaQr(data.qr);
  }
  async function confirmMfa() {
    try {
      await api.post('/auth/mfa/enable', { code: mfaCode });
      setMfaDone(true);
      setMfaQr(null);
    } catch {
      alert('Code invalide, réessayez.');
    }
  }

  async function loadAll() {
    const [c, a, o] = await Promise.all([
      api.get<Container[]>('/containers'),
      api.get<Alert[]>('/alerts', { params: { status: 'OPEN' } }),
      api.get<Overview>('/reports/overview'),
    ]);
    setContainers(c.data);
    setAlerts(a.data);
    setOverview(o.data);
  }

  useEffect(() => {
    loadAll();
    const socket = getSocket();
    socket.on('container:update', (updated: Container) => {
      setContainers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    });
    socket.on('alert:new', (alert: Alert) => {
      setAlerts((prev) => [alert, ...prev.filter((x) => x.id !== alert.id)].slice(0, 50));
    });
    const refresh = setInterval(() => api.get<Overview>('/reports/overview').then((r) => setOverview(r.data)), 15000);
    return () => {
      socket.off('container:update');
      socket.off('alert:new');
      clearInterval(refresh);
    };
  }, []);

  async function optimize() {
    setOptimizing(true);
    try {
      const { data } = await api.post<CollectionRoute>('/routes/optimize', { minFillLevel: minFill });
      setRoute(data);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Aucune tournée générée.');
    } finally {
      setOptimizing(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">Pilotage de la collecte</h1>
      <p className="text-ink/50 text-sm mb-5">Vue temps réel des conteneurs de la métropole.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Kpi label="Conteneurs" value={overview?.totalContainers ?? '—'} />
        <Kpi label="À collecter" value={overview?.toCollect ?? '—'} accent="#b06a00" />
        <Kpi label="Critiques" value={overview?.byStatus?.CRITICAL ?? '—'} accent="#c23a31" />
        <Kpi label="Remplissage moy." value={overview ? `${overview.averageFillLevel}%` : '—'} />
        <Kpi label="Alertes" value={overview?.openAlerts ?? '—'} accent="#c23a31" />
        <Kpi label="Signalements" value={overview?.newSignalements ?? '—'} accent="#0f6b41" />
      </div>

      <div className="mt-5 flex flex-col lg:flex-row gap-5">
        {/* Carte */}
        <div className="card relative overflow-hidden flex-1 h-[55vh] lg:h-[68vh]">
          <ContainerMap containers={containers} routeStops={route?.stops} />
          <div className="absolute bottom-3 left-3 z-[500] bg-white/90 backdrop-blur rounded-xl px-3 py-2 shadow-soft flex gap-3 text-xs font-semibold">
            {LEGEND.map((x) => (
              <span key={x.l} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: x.c }} />
                {x.l}
              </span>
            ))}
          </div>
        </div>

        {/* Panneau */}
        <aside className="w-full lg:w-96 flex flex-col gap-5">
          <div className="card p-5">
            <h3 className="font-bold text-lg mb-1">Tournée optimisée</h3>
            <p className="text-sm text-ink/50 mb-3">Algorithme TSP + 2-opt sur les conteneurs à collecter.</p>
            <label className="flex items-center justify-between gap-3 mb-3 text-sm">
              <span className="text-ink/60">Seuil de collecte</span>
              <span className="flex items-center gap-2">
                <input
                  type="range"
                  min={30}
                  max={95}
                  value={minFill}
                  onChange={(e) => setMinFill(+e.target.value)}
                  className="accent-brand-600"
                />
                <span className="font-display font-bold w-10 text-right">{minFill}%</span>
              </span>
            </label>
            <button onClick={optimize} disabled={optimizing} className="btn-primary w-full">
              {optimizing ? 'Optimisation…' : '🚛 Générer une tournée'}
            </button>
            {route && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-brand-50 rounded-xl py-2">
                  <div className="font-display font-extrabold text-xl text-brand-700">{route.stops.length}</div>
                  <div className="label">arrêts</div>
                </div>
                <div className="bg-brand-50 rounded-xl py-2">
                  <div className="font-display font-extrabold text-xl text-brand-700">{(route.totalDistanceMeters / 1000).toFixed(1)}</div>
                  <div className="label">km</div>
                </div>
                <div className="bg-brand-50 rounded-xl py-2">
                  <div className="font-display font-extrabold text-xl text-brand-700">{route.estimatedDurationMin}</div>
                  <div className="label">min</div>
                </div>
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-lg mb-1">Rapport mensuel</h3>
            <p className="text-sm text-ink/50 mb-3">Synthèse exportable en PDF (UC-G03).</p>
            <div className="flex gap-2">
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="input flex-1" />
              <button onClick={downloadReport} className="btn-dark whitespace-nowrap">
                📄 PDF
              </button>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-lg mb-1">Sécurité — MFA</h3>
            {user?.mfaEnabled || mfaDone ? (
              <p className="text-sm text-status-ok font-semibold">✓ Double authentification activée.</p>
            ) : mfaQr ? (
              <div className="text-center">
                <p className="text-xs text-ink/50 mb-2">Scannez avec Google Authenticator / Authy, puis saisissez le code.</p>
                <img src={mfaQr} alt="QR MFA" className="mx-auto w-36 h-36" />
                <div className="flex gap-2 mt-2">
                  <input
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="input text-center tracking-widest"
                  />
                  <button onClick={confirmMfa} className="btn-primary">Activer</button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-ink/50 mb-3">Recommandée pour les comptes gestionnaire et administrateur.</p>
                <button onClick={startMfa} className="btn-dark w-full">🔐 Activer la MFA</button>
              </>
            )}
          </div>

          <div className="card p-5 flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">Alertes</h3>
              <span className="pill bg-status-crit/10 text-status-crit">{alerts.length} ouvertes</span>
            </div>
            {alerts.length === 0 && <p className="text-sm text-ink/40">Aucune alerte en cours. 🎉</p>}
            <ul className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
              {alerts.map((a) => (
                <li
                  key={a.id}
                  className="flex gap-3 items-start rounded-xl bg-ink/[0.02] p-3 border-l-4"
                  style={{ borderColor: a.severity === 'CRITICAL' ? '#d6453d' : a.severity === 'WARNING' ? '#e08700' : '#9aa39d' }}
                >
                  <span className="text-sm leading-snug text-ink/80">{a.message}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
