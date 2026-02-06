import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validazione base
    if (!email.trim() || !password.trim()) {
      setError('Inserisci email e password.');
      return;
    }

    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri.');
      return;
    }

    setIsSubmitting(true);

    if (mode === 'login') {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      }
      // Se il login ha successo, il componente si smonta automaticamente
      // perché App.tsx renderà il contenuto principale
    } else {
      const result = await signUp(email, password, fullName);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Registrazione completata! Se richiesta, conferma la tua email prima di accedere.');
        setMode('login');
        setPassword('');
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / Branding */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            ESRS Compliance Platform
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Enterprise Architecture & Design Documentation
          </p>
        </div>

        {/* Card Login / Registrazione */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">
              {mode === 'login' ? 'Accedi al tuo account' : 'Crea un nuovo account'}
            </CardTitle>
            <CardDescription>
              {mode === 'login'
                ? 'Inserisci le tue credenziali per accedere alla piattaforma.'
                : 'Registrati per accedere alla piattaforma. Il tuo ruolo verrà assegnato da un Admin.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Messaggi di errore */}
              {error && (
                <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Messaggi di successo */}
              {success && (
                <div className="flex items-start gap-2 text-green-700 bg-green-50 border border-green-200 p-3 rounded-lg text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Campo Nome (solo registrazione) */}
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Mario Rossi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-white"
                  />
                </div>
              )}

              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@azienda.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  disabled={isSubmitting}
                  required
                  className="bg-white"
                />
              </div>

              {/* Campo Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimo 6 caratteri"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  disabled={isSubmitting}
                  required
                  className="bg-white"
                />
              </div>

              {/* Pulsante Submit */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : mode === 'login' ? (
                  <LogIn className="mr-2 h-4 w-4" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                {mode === 'login' ? 'Accedi' : 'Registrati'}
              </Button>
            </form>

            {/* Toggle Login / Registrazione */}
            <div className="mt-6 text-center text-sm">
              {mode === 'login' ? (
                <p className="text-slate-500">
                  Non hai un account?{' '}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 font-medium underline-offset-4 hover:underline"
                    onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
                  >
                    Registrati
                  </button>
                </p>
              ) : (
                <p className="text-slate-500">
                  Hai già un account?{' '}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 font-medium underline-offset-4 hover:underline"
                    onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                  >
                    Accedi
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info ruoli */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>Dopo la registrazione il tuo ruolo predefinito sarà <strong>Data Collector</strong>.</p>
          <p>Un Admin potrà assegnarti un ruolo diverso (Reviewer, Admin).</p>
        </div>
      </div>
    </div>
  );
}
