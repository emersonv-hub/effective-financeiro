import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showAccept?: boolean;
}

export function LGPDModal({ open, onClose, onAccept, showAccept = false }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield size={18} className="text-[#2250fc]" />
            Termo de Consentimento e Política de Privacidade
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p className="text-xs text-muted-foreground">
            Em conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais — LGPD (Lei nº 13.709/2018)</strong>
          </p>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">1. Controlador dos dados</h3>
            <p>
              <strong>Effective Fisioterapia</strong>, CNPJ/CPF a definir, com sede em Ribeirão Preto/SP, doravante denominada
              <em> Clínica</em>, é a controladora responsável pelo tratamento dos seus dados pessoais.
              Contato do encarregado (DPO): <strong>contato@effective.com.br</strong>
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">2. Dados coletados</h3>
            <p>Para a prestação dos serviços de fisioterapia, a Clínica coleta:</p>
            <ul className="list-disc pl-5 space-y-0.5 mt-1">
              <li>Dados de identificação: nome completo, CPF, data de nascimento, gênero, RG</li>
              <li>Dados de contato: telefone, e-mail, endereço residencial</li>
              <li>Dados de saúde (dados sensíveis): diagnóstico, histórico clínico, evolução de sessões, plano de saúde</li>
              <li>Dados financeiros: plano de atendimento contratado, pagamentos realizados</li>
              <li>Dados de acesso: registros de atendimentos, presença e evolução clínica</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">3. Finalidade e base legal</h3>
            <p>Os dados são tratados exclusivamente para:</p>
            <ul className="list-disc pl-5 space-y-0.5 mt-1">
              <li><strong>Prestação de serviço de saúde</strong> — Art. 7º, VIII e Art. 11, II, "f" da LGPD (tutela da saúde)</li>
              <li><strong>Cumprimento de obrigação legal</strong> — Resolução CFisio, prontuários obrigatórios</li>
              <li><strong>Gestão de contratos e cobrança</strong> — Art. 7º, V da LGPD (execução de contrato)</li>
              <li><strong>Comunicações sobre agendamentos</strong> — com base no legítimo interesse (Art. 7º, IX)</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">4. Compartilhamento</h3>
            <p>
              Seus dados <strong>não são vendidos</strong> a terceiros. Podem ser compartilhados somente:
            </p>
            <ul className="list-disc pl-5 space-y-0.5 mt-1">
              <li>Com outros profissionais da Clínica diretamente envolvidos no seu tratamento</li>
              <li>Com convênios/planos de saúde para faturamento, quando aplicável</li>
              <li>Por obrigação legal (autoridades de saúde, ANVISA, judicialmente)</li>
              <li>Com fornecedores de tecnologia sob contrato de confidencialidade (ex.: Supabase, para armazenamento seguro)</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">5. Retenção</h3>
            <p>
              Os dados de saúde são retidos por <strong>20 anos</strong> após o término do tratamento,
              conforme Resolução CFisio nº 424/2013. Dados financeiros são guardados por 5 anos (obrigação fiscal).
              Após esses prazos, os dados são anonimizados ou eliminados.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">6. Seus direitos (Art. 17 a 22 da LGPD)</h3>
            <p>Você tem direito a:</p>
            <ul className="list-disc pl-5 space-y-0.5 mt-1">
              <li><strong>Acesso</strong> — saber quais dados possuímos sobre você</li>
              <li><strong>Correção</strong> — atualizar dados incompletos ou incorretos</li>
              <li><strong>Portabilidade</strong> — receber seus dados em formato estruturado</li>
              <li><strong>Eliminação</strong> — solicitar exclusão dos dados desnecessários (respeitados os prazos legais)</li>
              <li><strong>Revogação do consentimento</strong> — a qualquer tempo, sem prejuízo do tratamento já realizado</li>
              <li><strong>Informação</strong> — sobre com quem seus dados foram compartilhados</li>
              <li><strong>Reclamação</strong> — junto à ANPD (Autoridade Nacional de Proteção de Dados)</li>
            </ul>
            <p className="mt-1">
              Para exercer qualquer direito, entre em contato pelo e-mail: <strong>contato@effective.com.br</strong>
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">7. Segurança</h3>
            <p>
              Os dados são armazenados em servidores seguros com criptografia em trânsito (TLS) e em repouso,
              controle de acesso por autenticação e trilhas de auditoria. A Clínica adota medidas técnicas e
              organizacionais alinhadas às boas práticas de segurança da informação.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">8. Consentimento</h3>
            <p>
              Ao marcar a caixa de consentimento, você autoriza o tratamento dos seus dados pessoais e de saúde
              pela Effective Fisioterapia nos termos desta política, de forma livre, informada e inequívoca,
              conforme exige o Art. 8º da Lei nº 13.709/2018.
            </p>
          </section>

          <p className="text-xs text-muted-foreground border-t pt-3">
            Última atualização: junho/2026 · Effective Fisioterapia — Ribeirão Preto/SP
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          {showAccept && onAccept ? (
            <>
              <Button onClick={onAccept} className="flex-1 bg-[#2250fc] hover:bg-[#1a3fd4]">
                Li e aceito os termos
              </Button>
              <Button variant="outline" onClick={onClose}>Fechar</Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose} className="ml-auto">Fechar</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
