import { useEffect, useState } from 'react';
import { api } from '../api';
import ContainerMap from '../components/ContainerMap';
import QrScanner from '../components/QrScanner';
import { CollectionRoute } from '../types';

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  PLANNED: { label: 'Planifiée', cls: 'bg-ink/5 text-ink/60' },
  IN_PROGRESS: { label: 'En cours', cls: 'bg-status-warn/15 text-status-warn' },
  COMPLETED: { label: 'Terminée', cls: 'bg-status-ok/15 text-status-ok' },
};

export default function Agent() {
  const [routes, setRoutes] = useState<CollectionRoute[]>([]);
  const [selected, setSelected] = useState<CollectionRoute | null>(null);
  const [scanning, setScanning] = useState(false);
  const [anomaly, setAnomaly] = useState('');
  const [anomalyMsg, setAnomalyMsg] = useState('');

  async function load(keepId?: string) {
    const { data } = await api.get<CollectionRoute[]>('/routes');
    setRoutes(data);
    setSelected((cur) => data.find((r) => r.id === (keepId ?? cur?.id)) ?? data[0] ?? null);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    await api.patch(`/routes/${id}/status`, { status });
    load(id);
  }

  // UC-A02 : valider la collecte d'un arrêt (volume + GPS)
  async function collectStop(containerId: string) {
    if (!selected) return;
    const volume = prompt('Volume collecté (litres) ? (optionnel)');
    const send = (lat?: number, lng?: number) =>
      api
        .post(`/routes/${selected.id}/stops/${containerId}/collect`, {
          volumeLiters: volume ? Number(volume) : undefined,
          lat,
          lng,
        })
        .then((r) => setSelected(r.data))
        .then(() => load(selected.id));
    navigator.geolocation.getCurrentPosition(
      (p) => send(p.coords.latitude, p.coords.longitude),
      () => send(),
    );
  }

  function onScan(code: string) {
    setScanning(false);
    const stop = selected?.stops.find((s) => s.code.toUpperCase() === code.trim().toUpperCase());
    if (!stop) return alert(`Aucun arrêt "${code}" dans cette tournée.`);
    if (stop.collected) return alert(`${code} déjà collecté.`);
    collectStop(stop.containerId);
  }

  // UC-A03 : anomalie terrain géolocalisée
  function reportAnomaly() {
    const send = (lat: number, lng: number) =>
      api
        .post('/signalements', { type: 'CONTENEUR_ENDOMMAGE', description: anomaly || 'Anomalie terrain', lat, lng })
        .then(() => {
          setAnomalyMsg('✅ Anomalie transmise au gestionnaire.');
          setAnomaly('');
          setTimeout(() => setAnomalyMsg(''), 3000);
        });
    navigator.geolocation.getCurrentPosition(
      (p) => send(p.coords.latitude, p.coords.longitude),
      () => send(45.764, 4.8357),
    );
  }

  const done = selected?.stops.filter((s) => s.collected).length ?? 0;

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
      {scanning && <QrScanner onDetected={onScan} onClose={() => setScanning(false)} />}

      <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">Mes tournées</h1>
      <p className="text-ink/50 text-sm mb-5">Itinéraires de collecte optimisés.</p>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Liste des tournées */}
        <aside className="w-full lg:w-72 flex flex-col gap-3 order-2 lg:order-1">
          {routes.length === 0 && <p className="text-sm text-ink/40">Aucune tournée planifiée.</p>}
          {routes.map((r) => {
            const st = STATUS_LABEL[r.status] ?? STATUS_LABEL.PLANNED;
            return (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                className={`text-left card p-4 transition ${selected?.id === r.id ? 'ring-2 ring-brand-500' : 'hover:shadow-lift'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">
                    {new Date(r.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`pill ${st.cls}`}>{st.label}</span>
                </div>
                <div className="text-sm text-ink/50 mt-1">
                  {r.stops.length} arrêts · {(r.totalDistanceMeters / 1000).toFixed(1)} km · ~{r.estimatedDurationMin} min
                </div>
              </button>
            );
          })}
        </aside>

        <div className="flex-1 flex flex-col gap-4 order-1 lg:order-2">
          {selected && (
            <div className="card p-4 flex flex-wrap items-center gap-3">
              <span className="text-sm text-ink/60 mr-auto font-medium">
                Progression : {done}/{selected.stops.length} collectés
              </span>
              <button onClick={() => setScanning(true)} className="btn-primary text-xs">
                📷 Scanner un QR
              </button>
              <button onClick={() => setStatus(selected.id, 'COMPLETED')} className="btn-dark text-xs">
                ✓ Clôturer
              </button>
            </div>
          )}

          <div className="card overflow-hidden h-[38vh] lg:h-[44vh]">
            <ContainerMap containers={[]} routeStops={selected?.stops} />
          </div>

          {/* UC-A02 : liste des arrêts */}
          {selected && (
            <div className="card p-4">
              <h3 className="font-bold mb-2">Arrêts</h3>
              <ul className="divide-y divide-ink/5 max-h-56 overflow-y-auto">
                {selected.stops.map((s) => (
                  <li key={s.containerId} className="flex items-center gap-3 py-2 text-sm">
                    <span className="w-6 h-6 grid place-items-center rounded-full bg-ink/5 text-xs font-bold">{s.order}</span>
                    <span className="font-medium">{s.code}</span>
                    <span className="text-ink/40">{s.fillLevel}%</span>
                    <span className="ml-auto">
                      {s.collected ? (
                        <span className="pill bg-status-ok/15 text-status-ok">✓ Collecté</span>
                      ) : (
                        <button onClick={() => collectStop(s.containerId)} className="btn-ghost text-xs !py-1.5">
                          Valider
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* UC-A03 : anomalie terrain */}
          <div className="card p-4">
            <h3 className="font-bold mb-2">⚠ Signaler une anomalie</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={anomaly}
                onChange={(e) => setAnomaly(e.target.value)}
                placeholder="Conteneur endommagé, accès bloqué…"
                className="input flex-1"
              />
              <button onClick={reportAnomaly} className="btn-dark whitespace-nowrap">
                Envoyer (📍 ma position)
              </button>
            </div>
            {anomalyMsg && <p className="text-brand-700 text-sm mt-2">{anomalyMsg}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
