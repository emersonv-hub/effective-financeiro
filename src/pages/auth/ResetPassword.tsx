import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { message: 'Senhas não conferem', path: ['confirm'] });

type Input = z.infer<typeof schema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Input>({ resolver: zodResolver(schema) });

  async function onSubmit(data: Input) {
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error) return;
    setDone(true);
    setTimeout(() => navigate('/login'), 3000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-4">
            <circle cx="24" cy="24" r="22" stroke="#728a9f" strokeWidth="3" fill="none" />
            <path d="M 32 14 A 12 12 0 0 1 32 34" stroke="#2250fc" strokeWidth="5" strokeLinecap="round" fill="none" />
          </svg>
          <h1 className="text-2xl font-bold text-[#3d3d2e] italic">effective</h1>
          <p className="text-[#728a9f] tracking-widest text-xs uppercase">FisioManager</p>
        </div>

        {done ? (
          <div className="text-center space-y-3">
            <CheckCircle size={48} className="mx-auto text-green-500" />
            <h2 className="text-xl font-semibold">Senha redefinida!</h2>
            <p className="text-muted-foreground text-sm">Redirecionando para o login...</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-1">Redefinir senha</h2>
            <p className="text-muted-foreground text-sm mb-6">Digite sua nova senha abaixo.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nova senha</Label>
                <div className="relative">
                  <Input type={showPw ? 'text' : 'password'} {...register('password')} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Confirmar senha</Label>
                <Input type="password" {...register('confirm')} placeholder="••••••••" />
                {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-[#2250fc] hover:bg-[#1a3fd4]" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 size={16} className="animate-spin mr-1" />Salvando...</> : 'Salvar nova senha'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
