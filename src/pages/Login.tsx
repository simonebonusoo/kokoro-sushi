import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { analytics } from '@/lib/analytics';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { restaurantConfig } from '@/config/restaurantConfig';
import { BrandLogo } from '@/components/BrandLogo';

const schema = z.object({
  email: z.string().email('Inserisci un\'email valida'),
  password: z.string().min(6, 'Minimo 6 caratteri'),
});
type FormData = z.infer<typeof schema>;

// Account dimostrativi disponibili solo quando l'app gira in modalità demo
// (nessuna credenziale Supabase reale configurata).
const demoAccounts = [
  { label: 'Cliente', email: 'cliente@kokoro.it', password: 'demo1234' },
  { label: 'Ristoratore', email: 'admin@kokoro.it', password: 'admin1234' },
];

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await signIn(data.email, data.password);
      if (!isSupabaseConfigured) {
        analytics.loginDemo(data.email === 'admin@kokoro.it' ? 'ristoratore' : 'cliente');
      }
      toast.success('Bentornato!');
      navigate(from, { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Accesso non riuscito');
    }
  };

  const handleReset = async () => {
    const email = getValues('email');
    if (!email) return toast.error('Inserisci prima la tua email');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) toast.error(error.message);
    else toast.success('Ti abbiamo inviato le istruzioni via email.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="inline-flex justify-center" aria-label={restaurantConfig.fullName}>
            <BrandLogo
              variant="auth"
              imageClassName="h-16 sm:h-20"
            />
          </Link>
          <p className="mt-1 text-sm text-brand-500">Accedi per gestire menu e prenotazioni</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="tua@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-medium text-brand-500 hover:text-brand-700"
            >
              Password dimenticata?
            </button>
            <Button type="submit" fullWidth loading={isSubmitting}>
              Accedi
            </Button>
          </form>

          {isSupabaseConfigured ? null : (
            <div className="mt-6 rounded-2xl border border-accent-500/25 bg-accent-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600">
                Accesso demo
              </p>
              <p className="mt-1.5 text-sm text-brand-500">
                Prova l’area riservata con un account dimostrativo.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => {
                      setValue('email', account.email, { shouldValidate: true });
                      setValue('password', account.password, { shouldValidate: true });
                    }}
                    className="rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-left transition hover:border-accent-500 hover:shadow-sm"
                  >
                    <span className="block text-sm font-semibold text-brand-900">{account.label}</span>
                    <span className="block truncate text-xs text-brand-400">{account.email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
        <p className="mt-6 text-center text-sm text-brand-500">
          Non hai un account?{' '}
          <Link to="/registrati" state={{ from }} className="font-semibold text-brand-800 hover:underline">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
}
