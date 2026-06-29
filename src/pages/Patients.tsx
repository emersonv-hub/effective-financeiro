import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PatientForm } from '@/components/patients/PatientForm';
import { usePatients } from '@/hooks/usePatients';
import { formatDate, formatPhone } from '@/lib/utils';
import { toast } from 'sonner';

export default function Patients() {
  const navigate = useNavigate();
  const { patients, loading, total, fetchPatients, createPatient, updatePatient } = usePatients();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  useEffect(() => { fetchPatients(search, page, pageSize); }, [search, page]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nome..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
        </div>
        <Button className="bg-[#2250fc] hover:bg-[#1a3fd4] shrink-0" onClick={() => setModalOpen(true)}>
          <Plus size={15} className="mr-1" />Novo Paciente
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Carregando...</div>
          ) : patients.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <UserX size={40} className="opacity-30" />
              <p className="text-sm">Nenhum paciente encontrado.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Telefone</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Diagnóstico</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Fisio Resp.</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Cadastro</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {patients.map(p => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate(`/pacientes/${p.id}`)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#2250fc]/10 text-[#2250fc] flex items-center justify-center text-xs font-bold shrink-0">
                              {p.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{p.full_name}</p>
                              {p.health_plan && <p className="text-xs text-muted-foreground">{p.health_plan}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.phone ? formatPhone(p.phone) : '—'}</td>
                        <td className="px-4 py-3 hidden lg:table-cell max-w-[200px]">
                          <p className="truncate text-muted-foreground">{p.diagnosis ?? '—'}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {p.responsible_fisio_profile ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.responsible_fisio_profile.color }} />
                              <span className="text-xs">{p.responsible_fisio_profile.full_name.split(' ')[0]}</span>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">{formatDate(p.created_at)}</td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/pacientes/${p.id}`)}>Ver</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {total > pageSize && (
                <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
                  <span>{page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} de {total}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                    <Button variant="outline" size="sm" disabled={(page + 1) * pageSize >= total} onClick={() => setPage(p => p + 1)}>Próximo</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <PatientForm open={modalOpen} onClose={() => setModalOpen(false)}
        onSave={async data => {
          try {
            await createPatient(data);
            setModalOpen(false);
            fetchPatients(search, page);
          } catch (err: any) {
            toast(err?.message ?? 'Erro ao salvar paciente.', { type: 'error' } as any);
          }
        }} />
    </div>
  );
}
