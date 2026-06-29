import { useEffect, useState } from 'react';
import { Loader2, Save, Trash2, Palette, Check, ShieldCheck, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { usePermissionsStore } from '@/stores/permissionsStore';
import { toast } from 'sonner';
import type { Profile } from '@/types';

const COLORS = ['#2250fc','#728a9f','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];

const MODULES = [
  { key: 'agenda',     label: 'Agenda' },
  { key: 'pacientes',  label: 'Pacientes' },
  { key: 'presenca',   label: 'Presença' },
  { key: 'financeiro', label: 'Financeiro' },
  { key: 'relatorios', label: 'Relatórios' },
];

const ROLES: { key: string; label: string }[] = [
  { key: 'fisioterapeuta', label: 'Fisioterapeuta' },
  { key: 'recepcionista',  label: 'Recepcionista'  },
];

export default function Settings() {
  const { profile, loadProfile, user } = useAuthStore();
  const { perms, loaded: permsLoaded, load: loadPerms, update: updatePerm } = usePermissionsStore();

  const [fisios, setFisios] = useState<Profile[]>([]);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '', crefito: '', color: '#2250fc' });
  const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '', role: 'fisioterapeuta', color: '#10b981' });
  const [creating, setCreating] = useState(false);

  const [colorPickerFor, setColorPickerFor]     = useState<string | null>(null);
  const [confirmDeleteFor, setConfirmDeleteFor] = useState<string | null>(null);
  const [actionLoading, setActionLoading]       = useState<string | null>(null);
  const [resetPwFor, setResetPwFor]             = useState<string | null>(null);
  const [resetPwValue, setResetPwValue]         = useState('');
  const [resetPwShow, setResetPwShow]           = useState(false);
  const [resetPwLoading, setResetPwLoading]     = useState(false);

  // Troca de senha própria
  const [ownPw, setOwnPw]         = useState({ current: '', next: '', confirm: '' });
  const [ownPwShow, setOwnPwShow] = useState(false);
  const [ownPwLoading, setOwnPwLoading] = useState(false);

  const loadFisios = async () => {
    const { data } = await supabase.from('fisio_profiles').select('*').order('full_name');
    setFisios((data ?? []) as Profile[]);
  };

  useEffect(() => {
    if (profile) setFormData({ full_name: profile.full_name, phone: profile.phone ?? '', crefito: profile.crefito ?? '', color: profile.color });
    loadFisios();
    loadPerms();
  }, [profile]);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    await supabase.from('fisio_profiles').update({ ...formData, updated_at: new Date().toISOString() }).eq('id', user.id);
    await loadProfile(user.id);
    setSaving(false);
    toast.success('Perfil salvo!');
  }

  async function updateUserColor(fisioId: string, color: string) {
    setActionLoading(fisioId);
    await supabase.from('fisio_profiles').update({ color }).eq('id', fisioId);
    setColorPickerFor(null);
    await loadFisios();
    setActionLoading(null);
    toast.success('Cor atualizada!');
  }

  async function softDeleteUser(fisio: Profile) {
    setActionLoading(fisio.id);
    try {
      await supabase.from('fisio_profiles').update({ active: false }).eq('id', fisio.id);
      toast.success(`${fisio.full_name} foi desativado.`);
      setConfirmDeleteFor(null);
      await loadFisios();
    } catch {
      toast.error('Erro ao desativar usuário.');
    } finally {
      setActionLoading(null);
    }
  }

  async function hardDeleteUser(fisio: Profile) {
    // Verifica vínculos antes de excluir
    const { count } = await supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('fisio_id', fisio.id);

    if (count && count > 0) {
      toast.error(`${fisio.full_name} possui ${count} agendamento(s) vinculado(s). Use "Desativar" para preservar o histórico.`);
      setConfirmDeleteFor(null);
      return;
    }

    setActionLoading(fisio.id);
    try {
      const { error } = await supabase.functions.invoke('admin-users', {
        body: { action: 'delete', user_id: fisio.id },
      });
      if (error) throw error;
      toast.success(`${fisio.full_name} foi excluído permanentemente.`);
      setConfirmDeleteFor(null);
      await loadFisios();
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro ao excluir usuário.');
    } finally {
      setActionLoading(null);
    }
  }

  async function createUser() {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast.error('Preencha nome, e-mail e senha.');
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'create',
          email: newUser.email,
          password: newUser.password,
          full_name: newUser.full_name,
          role: newUser.role,
          color: newUser.color,
        },
      });
      if (error || !data?.id) throw new Error(error?.message ?? 'Erro ao criar usuário');
      toast.success(`Usuário ${newUser.full_name} criado com sucesso!`);
      setNewUser({ email: '', password: '', full_name: '', role: 'fisioterapeuta', color: '#10b981' });
      await loadFisios();
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao criar usuário.');
    } finally {
      setCreating(false);
    }
  }

  async function changeOwnPassword() {
    if (!ownPw.next || !ownPw.confirm) { toast.error('Preencha a nova senha e a confirmação.'); return; }
    if (ownPw.next !== ownPw.confirm) { toast.error('As senhas não coincidem.'); return; }
    if (ownPw.next.length < 6) { toast.error('A senha deve ter pelo menos 6 caracteres.'); return; }
    setOwnPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: ownPw.next });
    setOwnPwLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Senha alterada com sucesso!');
    setOwnPw({ current: '', next: '', confirm: '' });
  }

  async function resetUserPassword(fisio: Profile) {
    if (!resetPwValue || resetPwValue.length < 6) { toast.error('A senha deve ter pelo menos 6 caracteres.'); return; }
    setResetPwLoading(true);
    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: { action: 'reset_password', user_id: fisio.id, password: resetPwValue },
    });
    setResetPwLoading(false);
    if (error || data?.error) { toast.error(data?.error ?? error?.message ?? 'Erro ao redefinir senha.'); return; }
    toast.success(`Senha de ${fisio.full_name} redefinida com sucesso!`);
    setResetPwFor(null);
    setResetPwValue('');
  }

  async function togglePermission(module: string, role: string) {
    const current = perms[module]?.[role] ?? true;
    await updatePerm(module, role, !current);
    toast.success('Permissão atualizada!');
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Meu Perfil */}
      <Card>
        <CardHeader><CardTitle>Meu Perfil</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5"><Label>Nome Completo</Label><Input value={formData.full_name} onChange={e => setFormData(d => ({ ...d, full_name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Telefone</Label><Input value={formData.phone} onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))} placeholder="(00) 00000-0000" /></div>
            <div className="space-y-1.5"><Label>CREFITO</Label><Input value={formData.crefito} onChange={e => setFormData(d => ({ ...d, crefito: e.target.value }))} /></div>
          </div>
          <div className="space-y-2">
            <Label>Cor na Agenda</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} onClick={() => setFormData(d => ({ ...d, color: c }))}
                  className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                  style={{ backgroundColor: c, borderColor: formData.color === c ? '#1a1f2e' : 'transparent' }}>
                  {formData.color === c && <Check size={12} className="text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={saveProfile} disabled={saving} className="bg-[#2250fc] hover:bg-[#1a3fd4]">
            {saving ? <Loader2 size={15} className="animate-spin mr-1" /> : <Save size={15} className="mr-1" />}Salvar Perfil
          </Button>

          <div className="border-t pt-4 mt-2 space-y-3">
            <p className="text-sm font-medium flex items-center gap-1.5"><KeyRound size={14} className="text-muted-foreground" />Alterar Senha</p>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nova senha</Label>
                <div className="relative">
                  <Input
                    type={ownPwShow ? 'text' : 'password'}
                    value={ownPw.next}
                    onChange={e => setOwnPw(p => ({ ...p, next: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                    className="pr-9"
                  />
                  <button type="button" onClick={() => setOwnPwShow(v => !v)}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                    {ownPwShow ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Confirmar nova senha</Label>
                <Input
                  type={ownPwShow ? 'text' : 'password'}
                  value={ownPw.confirm}
                  onChange={e => setOwnPw(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Repita a nova senha"
                />
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={changeOwnPassword} disabled={ownPwLoading}>
              {ownPwLoading ? <Loader2 size={13} className="animate-spin mr-1" /> : <KeyRound size={13} className="mr-1" />}
              Alterar senha
            </Button>
          </div>
        </CardContent>
      </Card>

      {profile?.role === 'admin' && (
        <>
          {/* Equipe */}
          <Card>
            <CardHeader><CardTitle>Equipe</CardTitle></CardHeader>
            <CardContent>
              <div className="divide-y">
                {fisios.map(f => (
                  <div key={f.id}>
                    <div className="flex items-center gap-3 py-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ backgroundColor: f.color }}>
                        {f.full_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{f.full_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{f.role}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${f.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {f.active ? 'Ativo' : 'Inativo'}
                      </span>

                      {f.id !== user?.id && (
                        <div className="flex items-center gap-1 shrink-0">
                          {f.active && (
                            <button onClick={() => setColorPickerFor(colorPickerFor === f.id ? null : f.id)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title="Alterar cor">
                              <Palette size={15} />
                            </button>
                          )}

                          <button
                            onClick={() => { setResetPwFor(resetPwFor === f.id ? null : f.id); setResetPwValue(''); setColorPickerFor(null); setConfirmDeleteFor(null); }}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Redefinir senha">
                            <KeyRound size={15} />
                          </button>

                          {confirmDeleteFor === f.id ? (
                            <div className="flex items-center gap-1 flex-wrap">
                              {f.active && (
                                <button onClick={() => softDeleteUser(f)} disabled={actionLoading === f.id}
                                  className="text-xs px-2 py-0.5 border rounded hover:bg-muted disabled:opacity-50">
                                  {actionLoading === f.id ? <Loader2 size={11} className="animate-spin" /> : 'Desativar'}
                                </button>
                              )}
                              <button onClick={() => hardDeleteUser(f)} disabled={actionLoading === f.id}
                                className="text-xs px-2 py-0.5 bg-destructive text-white rounded hover:bg-destructive/90 disabled:opacity-50">
                                {actionLoading === f.id ? <Loader2 size={11} className="animate-spin" /> : 'Excluir definitivo'}
                              </button>
                              <button onClick={() => setConfirmDeleteFor(null)}
                                className="text-xs px-2 py-0.5 text-muted-foreground hover:text-foreground">
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDeleteFor(f.id)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Excluir usuário">
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {colorPickerFor === f.id && (
                      <div className="pb-3 pl-12 flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground mr-1">Cor:</span>
                        {COLORS.map(c => (
                          <button key={c} onClick={() => updateUserColor(f.id, c)} disabled={actionLoading === f.id}
                            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center disabled:opacity-50"
                            style={{ backgroundColor: c, borderColor: f.color === c ? '#1a1f2e' : 'transparent' }}>
                            {f.color === c && <Check size={12} className="text-white" strokeWidth={3} />}
                          </button>
                        ))}
                      </div>
                    )}

                    {resetPwFor === f.id && (
                      <div className="pb-3 pl-12 flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground shrink-0">Nova senha:</span>
                        <div className="relative flex-1 min-w-[180px] max-w-xs">
                          <Input
                            type={resetPwShow ? 'text' : 'password'}
                            value={resetPwValue}
                            onChange={e => setResetPwValue(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            className="h-8 text-sm pr-9"
                          />
                          <button type="button" onClick={() => setResetPwShow(v => !v)}
                            className="absolute right-2 top-2 text-muted-foreground hover:text-foreground">
                            {resetPwShow ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                        <Button size="sm" className="h-8 bg-[#2250fc] hover:bg-[#1a3fd4]"
                          onClick={() => resetUserPassword(f)} disabled={resetPwLoading}>
                          {resetPwLoading ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
                          Salvar
                        </Button>
                        <button onClick={() => { setResetPwFor(null); setResetPwValue(''); }}
                          className="text-xs text-muted-foreground hover:text-foreground">Cancelar</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Permissões dos Módulos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#2250fc]" />
                Permissões dos Módulos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">
                Admin sempre tem acesso total. Configure o acesso para Fisioterapeuta e Recepcionista.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Módulo</th>
                      <th className="text-center py-2 px-4 font-medium text-muted-foreground">Admin</th>
                      {ROLES.map(r => (
                        <th key={r.key} className="text-center py-2 px-4 font-medium text-muted-foreground">{r.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {!permsLoaded ? (
                      <tr><td colSpan={4} className="py-6 text-center text-muted-foreground text-sm"><Loader2 size={16} className="animate-spin inline mr-2" />Carregando...</td></tr>
                    ) : MODULES.map(m => (
                      <tr key={m.key} className="hover:bg-muted/30">
                        <td className="py-3 pr-4 font-medium">{m.label}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="w-5 h-5 rounded bg-[#2250fc] flex items-center justify-center mx-auto">
                            <Check size={12} className="text-white" strokeWidth={3} />
                          </div>
                        </td>
                        {ROLES.map(r => {
                          const allowed = perms[m.key]?.[r.key] ?? true;
                          return (
                            <td key={r.key} className="py-3 px-4 text-center">
                              <button
                                onClick={() => togglePermission(m.key, r.key)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-colors ${
                                  allowed
                                    ? 'bg-[#2250fc] border-[#2250fc]'
                                    : 'bg-white border-gray-300 hover:border-[#2250fc]'
                                }`}
                              >
                                {allowed && <Check size={12} className="text-white" strokeWidth={3} />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Criar Novo Usuário */}
          <Card>
            <CardHeader><CardTitle>Criar Novo Usuário</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5"><Label>Nome</Label><Input value={newUser.full_name} onChange={e => setNewUser(d => ({ ...d, full_name: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label>E-mail</Label><Input type="email" value={newUser.email} onChange={e => setNewUser(d => ({ ...d, email: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label>Senha Inicial</Label><Input type="password" value={newUser.password} onChange={e => setNewUser(d => ({ ...d, password: e.target.value }))} /></div>
                <div className="space-y-1.5">
                  <Label>Papel</Label>
                  <Select onValueChange={v => setNewUser(d => ({ ...d, role: v }))} defaultValue="fisioterapeuta">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="fisioterapeuta">Fisioterapeuta</SelectItem>
                      <SelectItem value="recepcionista">Recepcionista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Cor na agenda</Label>
                  <div className="flex gap-2 flex-wrap pt-1">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setNewUser(d => ({ ...d, color: c }))}
                        className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                        style={{ backgroundColor: c, borderColor: newUser.color === c ? '#1a1f2e' : 'transparent' }}>
                        {newUser.color === c && <Check size={11} className="text-white" strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Button onClick={createUser} disabled={creating} className="bg-[#2250fc] hover:bg-[#1a3fd4]">
                {creating && <Loader2 size={15} className="animate-spin mr-1" />}Criar Usuário
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
