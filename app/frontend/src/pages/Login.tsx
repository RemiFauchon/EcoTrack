import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

const DEMO = [
  { label: 'Gestionnaire', email: 'gestionnaire@ecotrack.fr', icon: '🗺️' },
  { label: 'Administrateur', email: 'admin@ecotrack.fr', icon: '🛠️' },
  { label: 'Agent', email: 'agent@ecotrack.fr', icon: '🚛' },
  { label: 'Citoyen', email: 'citoyen@ecotrack.fr', icon: '♻️' },
];

export default function Login() {
  const { login, verifyMfa, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('gestionnaire@ecotrack.fr');
  const [password, setPassword] = useState('Password123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [code, setCode] = useState('');

  useEffect(() => {
    if (!user) return;
    if (user.role === 'AGENT') navigate('/agent');
    else if (user.role === 'CITOYEN') navigate('/citoyen');
    else navigate('/dashboard');
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await login(email, password);
      if (res.mfaRequired && res.mfaToken) setMfaToken(res.mfaToken);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Identifiants invalides.');
    } finally {
      setBusy(false);
    }
  }

  async function submitMfa(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await verifyMfa(mfaToken!, code);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Code invalide.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-full grid lg:grid-cols-2">
      {/* Volet branding (caché sur mobile) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-ink text-paper relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(800px 400px at 20% 20%, rgba(22,134,80,0.6), transparent), radial-gradient(600px 600px at 90% 80%, rgba(51,161,105,0.4), transparent)',
          }}
        />
        <div className="relative flex items-center gap-2">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-brand-500 text-white text-xl">♻︎</span>
          <span className="font-display font-extrabold text-2xl">ECOTRACK</span>
        </div>
        <div className="relative">
          <h2 className="font-display text-4xl font-extrabold leading-tight">
            La collecte des déchets,<br />pilotée par la donnée.
          </h2>
          <p className="mt-4 text-paper/70 max-w-md">
            2 000 conteneurs connectés, tournées optimisées, citoyens engagés. Une métropole plus propre,
            mesurée en temps réel.
          </p>
        </div>
        <div className="relative flex gap-8 text-sm">
          <div>
            <div className="font-display font-extrabold text-2xl text-brand-300">−20%</div>
            <div className="text-paper/60">distances</div>
          </div>
          <div>
            <div className="font-display font-extrabold text-2xl text-brand-300">−18%</div>
            <div className="text-paper/60">CO₂</div>
          </div>
          <div>
            <div className="font-display font-extrabold text-2xl text-brand-300">&lt;2%</div>
            <div className="text-paper/60">débordements</div>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-rise">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-brand-500 text-white text-xl">♻︎</span>
            <span className="font-display font-extrabold text-2xl">ECOTRACK</span>
          </div>

          {mfaToken ? (
            <>
              <h1 className="text-2xl font-extrabold">Vérification</h1>
              <p className="text-ink/50 text-sm mb-6">Saisissez le code à 6 chiffres de votre application d'authentification.</p>
              <form onSubmit={submitMfa} className="space-y-3">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  inputMode="numeric"
                  className="input text-center text-2xl tracking-[0.4em] font-display"
                  autoFocus
                />
                {error && <p className="text-status-crit text-sm">{error}</p>}
                <button type="submit" disabled={busy || code.length !== 6} className="btn-primary w-full">
                  {busy ? 'Vérification…' : 'Valider le code'}
                </button>
                <button type="button" onClick={() => { setMfaToken(null); setCode(''); setError(''); }} className="btn-ghost w-full">
                  Retour
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold">Connexion</h1>
              <p className="text-ink/50 text-sm mb-6">Accédez à votre espace.</p>

              <form onSubmit={submit} className="space-y-3">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" className="input" />
                {error && <p className="text-status-crit text-sm">{error}</p>}
                <button type="submit" disabled={busy} className="btn-primary w-full">
                  {busy ? 'Connexion…' : 'Se connecter'}
                </button>
              </form>
            </>
          )}

          <div className={`mt-8 ${mfaToken ? 'hidden' : ''}`}>
            <p className="label mb-2">Comptes de démo · mdp Password123</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO.map((d) => (
                <button
                  key={d.email}
                  onClick={() => setEmail(d.email)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                    email === d.email ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink/10 hover:bg-ink/5'
                  }`}
                >
                  <span>{d.icon}</span>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
