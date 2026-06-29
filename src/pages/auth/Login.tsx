import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/Logo';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
    if (error) { setError('E-mail ou senha inválidos.'); return; }
    navigate('/dashboard');
  }

  async function handleReset() {
    const email = getValues('email');
    if (!email) { setError('Digite seu e-mail primeiro.'); return; }
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setResetSent(true);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1f2e] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{ width: 200 + i * 120, height: 200 + i * 120, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          ))}
        </div>
        <div className="relative text-center">
          <div className="flex justify-center mb-3">
            <Logo size="xl" theme="dark" />
          </div>
          <p className="text-[#728a9f] tracking-[0.25em] uppercase text-xs font-semibold mb-8">FisioManager</p>
          <p className="text-[#9aa5be] text-sm max-w-xs leading-relaxed">
            Sistema completo de gestão para clínicas de fisioterapia. Agenda, pacientes, presença e financeiro em um só lugar.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-8">
            <Logo size="md" theme="light" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Bem-vindo de volta</h2>
          <p className="text-muted-foreground text-sm mb-8">Entre com suas credenciais para continuar</p>

          {resetSent && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm mb-4">
              Link de redefinição enviado para seu e-mail!
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...register('password')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

            <Button type="submit" className="w-full bg-[#2250fc] hover:bg-[#1a3fd4]" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Entrando...</> : 'Entrar'}
            </Button>
          </form>

          <button onClick={handleReset} className="mt-4 text-sm text-[#2250fc] hover:underline w-full text-center">
            Esqueci minha senha
          </button>
        </div>
      </div>
    </div>
  );
}
