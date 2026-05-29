import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import ContainerMap from '../components/ContainerMap';
import { Challenge, Container, GamificationProfile, LeaderboardEntry, Signalement } from '../types';

const TYPES = [
  { value: 'CONTENEUR_PLEIN', label: 'Conteneur plein', icon: '🗑️' },
  { value: 'DEPOT_SAUVAGE', label: 'Dépôt sauvage', icon: '⚠️' },
  { value: 'CONTENEUR_ENDOMMAGE', label: 'Endommagé', icon: '🔧' },
];

// Estimation : chaque signalement évite une collecte inutile / un débordement (~2,3 kg CO₂).
const CO2_PER_SIGNALEMENT = 2.3;

export default function Citizen() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [mine, setMine] = useState<Signalement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [type, setType] = useState(TYPES[0].value);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const [c, p, l, m, ch] = await Promise.all([
      api.get<Container[]>('/containers'),
      api.get<GamificationProfile>('/gamification/me'),
      api.get<LeaderboardEntry[]>('/gamification/leaderboard'),
      api.get<Signalement[]>('/signalements/mine'),
      api.get<Challenge[]>('/challenges'),
    ]);
    setContainers(c.data);
    setProfile(p.data);
    setLeaderboard(l.data);
    setMine(m.data);
    setChallenges(ch.data);
  }

  async function joinChallenge(id: string) {
    await api.post(`/challenges/${id}/join`);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function submit() {
    if (!pos) {
      setMsg('📍 Touchez la carte pour situer le signalement.');
      return;
    }
    await api.post('/signalements', { type, description, lat: pos.lat, lng: pos.lng, photoUrl: photo ?? undefined });
    setMsg('✅ Signalement envoyé, +10 points !');
    setDescription('');
    setPos(null);
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = '';
    load();
  }

  const nextBadge = profile?.badges.find((b) => !b.unlocked);
  const co2 = (mine.length * CO2_PER_SIGNALEMENT).toFixed(1);

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">Espace citoyen</h1>
      <p className="text-ink/50 text-sm mb-5">Signalez un problème, gagnez des points, grimpez au classement.</p>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="card overflow-hidden flex-1 h-[45vh] lg:h-[70vh]">
          <ContainerMap containers={containers} onMapClick={(lat, lng) => setPos({ lat, lng })} />
        </div>

        <aside className="w-full lg:w-96 flex flex-col gap-5">
          {/* Signalement */}
          <div className="card p-5">
            <h3 className="font-bold text-lg mb-1">Signaler un problème</h3>
            <p className="text-xs text-ink/45 mb-3">
              {pos ? `📍 ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}` : 'Touchez la carte pour situer le signalement.'}
            </p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition ${
                    type === t.value ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink/10 hover:bg-ink/5'
                  }`}
                >
                  <div className="text-lg">{t.icon}</div>
                  {t.label}
                </button>
              ))}
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails (optionnel)"
              className="input mb-3"
              rows={2}
            />
            <div className="flex items-center gap-3 mb-3">
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPhoto} className="text-xs flex-1" />
              {photo && <img src={photo} alt="aperçu" className="w-12 h-12 rounded-lg object-cover" />}
            </div>
            <button onClick={submit} className="btn-primary w-full">
              Envoyer le signalement
            </button>
            {msg && <p className="text-xs text-brand-700 mt-2 font-medium">{msg}</p>}
          </div>

          {/* Points + impact + badges */}
          <div className="card p-5">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-brand-50 rounded-xl p-3">
                <div className="label">Mes points</div>
                <div className="font-display font-extrabold text-3xl text-brand-600">{profile?.points ?? 0}</div>
              </div>
              <div className="bg-brand-50 rounded-xl p-3">
                <div className="label">CO₂ évité</div>
                <div className="font-display font-extrabold text-3xl text-brand-600">
                  {co2}<span className="text-base"> kg</span>
                </div>
              </div>
            </div>
            {nextBadge && (
              <p className="text-xs text-ink/45 mb-2">
                Prochain badge {nextBadge.icon} {nextBadge.label} à {nextBadge.threshold} pts
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {profile?.badges.map((b) => (
                <div key={b.code} title={`${b.label} — ${b.description}`} className="flex flex-col items-center w-14">
                  <div className={`text-3xl transition ${b.unlocked ? '' : 'opacity-20 grayscale'}`}>{b.icon}</div>
                  <div className="text-[10px] text-center text-ink/50 mt-0.5 leading-tight">{b.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mes signalements */}
          <div className="card p-5">
            <h3 className="font-bold text-lg mb-3">Mes signalements ({mine.length})</h3>
            {mine.length === 0 && <p className="text-sm text-ink/40">Aucun signalement pour l'instant.</p>}
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {mine.map((s) => (
                <li key={s.id} className="flex items-center justify-between text-sm border-b border-ink/5 pb-1.5">
                  <span>{TYPES.find((t) => t.value === s.type)?.label ?? s.type}</span>
                  <span className={`pill ${s.status === 'RESOLVED' ? 'bg-status-ok/15 text-status-ok' : 'bg-ink/5 text-ink/50'}`}>
                    {s.status === 'RESOLVED' ? 'Résolu' : 'En cours'}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Défis collectifs (UC-C03) */}
          <div className="card p-5">
            <h3 className="font-bold text-lg mb-3">🎯 Défis collectifs</h3>
            {challenges.length === 0 && <p className="text-sm text-ink/40">Aucun défi en cours.</p>}
            <div className="space-y-3">
              {challenges.map((c) => {
                const pct = Math.min(100, Math.round((c.current / c.goal) * 100));
                return (
                  <div key={c.id} className="rounded-xl bg-ink/[0.02] p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{c.title}</span>
                      <span className="pill bg-brand-50 text-brand-700">+{c.rewardPoints} pts</span>
                    </div>
                    <p className="text-xs text-ink/45 mb-2">{c.description}</p>
                    <div className="h-2 rounded-full bg-ink/10 overflow-hidden">
                      <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-ink/50">
                        {c.current}/{c.goal}
                        {c.joined && ` · vous : ${c.myContribution}`}
                      </span>
                      {c.completed ? (
                        <span className="pill bg-status-ok/15 text-status-ok">Réussi 🎉</span>
                      ) : c.joined ? (
                        <span className="text-xs text-brand-600 font-semibold">Inscrit ✓</span>
                      ) : (
                        <button onClick={() => joinChallenge(c.id)} className="btn-primary text-xs !py-1.5">
                          Rejoindre
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Classement */}
          <div className="card p-5">
            <h3 className="font-bold text-lg mb-3">🏆 Classement</h3>
            <ol className="space-y-1.5">
              {leaderboard.map((e) => (
                <li key={e.userId} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`w-6 h-6 grid place-items-center rounded-full text-xs font-bold ${e.rank <= 3 ? 'bg-brand-500 text-white' : 'bg-ink/5 text-ink/60'}`}>
                      {e.rank}
                    </span>
                    {e.name}
                  </span>
                  <span className="font-display font-bold">{e.points}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
