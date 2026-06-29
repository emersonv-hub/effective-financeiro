import { useEffect, useState } from 'react';
import { Plus, DollarSign, TrendingDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PaymentForm } from '@/components/financial/PaymentForm';
import { ExpenseForm } from '@/components/financial/ExpenseForm';
import { usePayments } from '@/hooks/usePayments';
import { formatBRL, formatDate, statusLabel } from '@/lib/utils';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export default function Financial() {
  const { payments, expenses, fetchPayments, fetchExpenses, createPayment, createExpense, updatePayment } = usePayments();
  const [paymentModal, setPaymentModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);
  const today = new Date();
  const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');

  useEffect(() => {
    fetchPayments({ startDate: monthStart, endDate: monthEnd });
    fetchExpenses(monthStart, monthEnd);
  }, []);

  const totalReceived = payments.filter(p => p.status === 'pago').reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payments.filter(p => p.status === 'pendente').reduce((s, p) => s + Number(p.amount), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center"><DollarSign size={20} className="text-green-600" /></div>
          <div><p className="text-sm text-muted-foreground">Recebido (mês)</p><p className="text-xl font-bold font-money">{formatBRL(totalReceived)}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center"><DollarSign size={20} className="text-amber-600" /></div>
          <div><p className="text-sm text-muted-foreground">A receber</p><p className="text-xl font-bold font-money">{formatBRL(totalPending)}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center"><TrendingDown size={20} className="text-red-500" /></div>
          <div><p className="text-sm text-muted-foreground">Despesas (mês)</p><p className="text-xl font-bold font-money">{formatBRL(totalExpenses)}</p></div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="payments">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="expenses">Despesas</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setExpenseModal(true)}><Plus size={14} className="mr-1" />Despesa</Button>
            <Button size="sm" className="bg-[#2250fc] hover:bg-[#1a3fd4]" onClick={() => setPaymentModal(true)}><Plus size={14} className="mr-1" />Pagamento</Button>
          </div>
        </div>

        <TabsContent value="payments">
          <Card><CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Paciente</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Data</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Método</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valor</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3" />
                </tr></thead>
                <tbody className="divide-y">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium">{p.patient?.full_name}</p>
                        {p.installments > 1 && <p className="text-xs text-muted-foreground">{p.installment_number}/{p.installments}x</p>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatDate(p.payment_date)}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">{statusLabel(p.payment_method)}</td>
                      <td className="px-4 py-3 text-right font-money font-semibold">{formatBRL(Number(p.amount))}</td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3">
                        {p.status === 'pendente' && (
                          <Button size="sm" variant="outline" className="text-green-600 text-xs h-7" onClick={() => updatePayment(p.id, { status: 'pago', payment_date: format(new Date(), 'yyyy-MM-dd') }).then(() => fetchPayments({ startDate: monthStart, endDate: monthEnd }))}>
                            Marcar pago
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payments.length === 0 && <p className="text-center py-10 text-muted-foreground text-sm">Nenhum pagamento neste período.</p>}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card><CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Descrição</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Data</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Categoria</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valor</th>
                </tr></thead>
                <tbody className="divide-y">
                  {expenses.map(e => (
                    <tr key={e.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{e.description}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatDate(e.expense_date)}</td>
                      <td className="px-4 py-3 hidden sm:table-cell"><span className="text-xs capitalize bg-muted px-2 py-0.5 rounded-full">{e.category}</span></td>
                      <td className="px-4 py-3 text-right font-money font-semibold text-red-600">- {formatBRL(Number(e.amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {expenses.length === 0 && <p className="text-center py-10 text-muted-foreground text-sm">Nenhuma despesa neste período.</p>}
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <PaymentForm open={paymentModal} onClose={() => setPaymentModal(false)} onSave={async d => { await createPayment(d); setPaymentModal(false); fetchPayments({ startDate: monthStart, endDate: monthEnd }); }} />
      <ExpenseForm open={expenseModal} onClose={() => setExpenseModal(false)} onSave={async d => { await createExpense(d); setExpenseModal(false); fetchExpenses(monthStart, monthEnd); }} />
    </div>
  );
}
