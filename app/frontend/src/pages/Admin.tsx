import { useEffect, useState } from 'react';
import { api } from '../api';
import { Role, Settings, User } from '../types';

const ROLES: Role[] = ['CITOYEN', 'AGENT', 'GESTIONNAIRE', 'ADMIN'];

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState('');

  async function load() {
    const [u, s] = await Promise.all([api.get<User[]>('/users'), api.get<Settings>('/settings')]);
    setUsers(u.data);
    setSettings(s.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function changeRole(id: string, role: Role) {
    await api.patch(`/users/${id}/role`, { role });
    load();
  }

  async function saveSettings() {
    if (!settings) return;
    await api.put('/settings', settings);
    setSaved('✅ Paramètres enregistrés');
    setTimeout(() => setSaved(''), 2500);
  }

  const set = (patch: Partial<Settings>) => setSettings((s) => (s ? { ...s, ...patch } : s));

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">Administration</h1>
      <p className="text-ink/50 text-sm mb-5">Utilisateurs, rôles et paramètres de la plateforme.</p>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Utilisateurs */}
        <div className="card p-5 flex-1 overflow-x-auto">
          <h3 className="font-bold text-lg mb-3">Utilisateurs ({users.length})</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left label border-b border-ink/10">
                <th className="py-2">Nom</th>
                <th>Email</th>
                <th>Points</th>
                <th>Rôle</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-ink/5">
                  <td className="py-2 font-medium">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="text-ink/60">{u.email}</td>
                  <td>{u.points}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value as Role)}
                      className="rounded-lg border border-ink/15 px-2 py-1 text-xs"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paramètres */}
        <div className="card p-5 w-full lg:w-96">
          <h3 className="font-bold text-lg mb-3">Paramètres d'alerte</h3>
          {settings && (
            <div className="space-y-4">
              <div>
                <div className="label mb-1">Seuils par défaut (%)</div>
                <div className="flex gap-2">
                  <label className="flex-1 text-sm">
                    <span className="text-ink/50 text-xs">Warning</span>
                    <input
                      type="number"
                      value={settings.defaultThresholdWarn}
                      onChange={(e) => set({ defaultThresholdWarn: +e.target.value })}
                      className="input"
                    />
                  </label>
                  <label className="flex-1 text-sm">
                    <span className="text-ink/50 text-xs">Critique</span>
                    <input
                      type="number"
                      value={settings.defaultThresholdCritical}
                      onChange={(e) => set({ defaultThresholdCritical: +e.target.value })}
                      className="input"
                    />
                  </label>
                </div>
              </div>

              <div>
                <div className="label mb-2">Canaux de notification</div>
                {([
                  ['emailAlerts', '📧 Email'],
                  ['pushAlerts', '🔔 Push'],
                  ['smsAlerts', '✉️ SMS'],
                ] as const).map(([key, lbl]) => (
                  <label key={key} className="flex items-center justify-between py-1.5">
                    <span className="text-sm">{lbl}</span>
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={(e) => set({ [key]: e.target.checked } as Partial<Settings>)}
                      className="w-5 h-5 accent-brand-600"
                    />
                  </label>
                ))}
              </div>

              <button onClick={saveSettings} className="btn-primary w-full">
                Enregistrer
              </button>
              {saved && <p className="text-brand-700 text-sm">{saved}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
