import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Patient, Profile } from '@/types';

export const PLANS = [
  { name: 'PLANO 1', sessions: 4,  value: 685.00,  label: 'Plano 1 — 4 atendimentos — R$ 685,00' },
  { name: 'PLANO 2', sessions: 8,  value: 1220.00, label: 'Plano 2 — 8 atendimentos — R$ 1.220,00' },
  { name: 'PLANO 3', sessions: 10, value: 1430.00, label: 'Plano 3 — 10 atendimentos — R$ 1.430,00' },
  { name: 'PLANO 4', sessions: 12, value: 1600.00, label: 'Plano 4 — 12 atendimentos — R$ 1.600,00' },
];

export interface ContractData {
  patient: Patient;
  fisio: Profile;
  plan: typeof PLANS[0];
  date?: Date;
}

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function gerarContratoPDF(data: ContractData): jsPDF {
  const { patient, fisio, plan, date = new Date() } = data;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 20;
  const maxW = 170;
  let y = 20;

  // ── Cabeçalho ──────────────────────────────────────────────────
  doc.setFillColor(34, 80, 252);
  doc.rect(0, 0, 210, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('effective FisioManager', margin, 9);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Ribeirão Preto / SP', 210 - margin, 9, { align: 'right' });
  doc.text('(16) 3516-5510 | (16) 99736-9010', 210 - margin, 14, { align: 'right' });

  y = 28;
  doc.setTextColor(40, 40, 40);

  // ── Título ──────────────────────────────────────────────────────
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  const titulo = 'Termo de Consentimento Para Adesão ao Plano de Tratamento Fisioterapêutico';
  const tituloLines = doc.splitTextToSize(titulo, maxW);
  doc.text(tituloLines, 105, y, { align: 'center' });
  y += tituloLines.length * 6 + 6;

  doc.setDrawColor(34, 80, 252);
  doc.line(margin, y, 210 - margin, y);
  y += 8;

  // ── Corpo ──────────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const intro = `As medidas descritas abaixo são estipuladas para que o serviço oferecido seja da mais alta qualidade para todos que o procuram e ao mesmo tempo aplicando-se descontos nos valores do serviço contratado em razão do fechamento do plano promocional.`;
  const introLines = doc.splitTextToSize(intro, maxW);
  doc.text(introLines, margin, y);
  y += introLines.length * 5 + 6;

  // Linha principal preenchida
  const endereco = [patient.address, patient.city, patient.cep].filter(Boolean).join(', ') || '___________________________________';
  const principal = `Eu ${patient.full_name}, portador(a) do CPF ${patient.cpf ?? '___________'}, residente e domiciliado(a) na ${endereco}, opto pelo plano promocional ${plan.name} (${plan.sessions} atendimentos) — ${formatBRL(plan.value)}, tendo desde já ciência que referida opção me beneficia com desconto levando em conta que a sessão individual detém o preço de R$ 180,00.`;
  const principalLines = doc.splitTextToSize(principal, maxW);
  doc.setFont('helvetica', 'bold');
  doc.text(principalLines, margin, y);
  y += principalLines.length * 5 + 6;
  doc.setFont('helvetica', 'normal');

  // Planos
  doc.setFont('helvetica', 'bold');
  doc.text('PACOTES:', margin, y); y += 6;
  doc.setFont('helvetica', 'normal');
  PLANS.forEach(p => {
    const isSelected = p.name === plan.name;
    if (isSelected) doc.setFont('helvetica', 'bold');
    doc.text(`${p.name} (${p.sessions} atendimentos) — ${formatBRL(p.value)}${isSelected ? '  ◄ SELECIONADO' : ''}`, margin + 4, y);
    if (isSelected) doc.setFont('helvetica', 'normal');
    y += 5;
  });
  y += 4;

  // Cláusulas
  const clausulas = [
    'Em razão da adesão ao plano promocional, estou ciente de que:',
    '',
    '1. Caso não possa comparecer à sessão de fisioterapia agendada previamente, o cancelamento/reagendamento deverá ser comunicado pelo telefone (16) 3516-5510 ou (16) 99736-9010, com no mínimo 4 (quatro) horas de antecedência; caso contrário, o pagamento referente à sessão será debitado normalmente.',
    '',
    '2. O não comparecimento a 2 (duas) sessões consecutivas, sem justificativa, implica em perda do horário fixo, podendo ser remarcado outro conforme disponibilidade.',
    '',
    '3. Uma vez estabelecido que o tratamento seja feito por meio do plano acima optado com pagamento adiantado, não haverá estorno do valor pago referente à sessão realizada. Contudo, caso haja interrupção/desistência, o paciente terá direito à devolução dos valores das sessões não realizadas, com dedução de multa de 20% sobre o total a ser devolvido (art. 51, II e IV do Código de Defesa do Consumidor).',
    '',
    '4. Nos casos de interrupção/desistência antes de finalizar o plano, o valor de cada sessão utilizada será cobrado como avulsa — R$ 190,00.',
    '',
    '5. O tratamento é exclusivo ao paciente contratante, portanto, intransferível.',
    '',
    `6. Validade do plano: ${plan.sessions === 4 ? '60 dias corridos' : '90 dias corridos'} a partir da primeira sessão realizada.`,
  ];

  for (const cl of clausulas) {
    if (y > 250) { doc.addPage(); y = 20; }
    if (cl === '') { y += 3; continue; }
    const lines = doc.splitTextToSize(cl, maxW);
    doc.text(lines, margin, y);
    y += lines.length * 5;
  }

  // LGPD notice
  y += 6;
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setFillColor(240, 245, 255);
  doc.roundedRect(margin, y, maxW, 16, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(34, 80, 252);
  doc.setFont('helvetica', 'bold');
  doc.text('Aviso de Privacidade — LGPD (Lei nº 13.709/2018)', margin + 3, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const lgpdText = 'Seus dados pessoais e de saúde são tratados pela Effective Fisioterapia exclusivamente para prestação dos serviços contratados, conforme nossa Política de Privacidade disponível na recepção.';
  const lgpdLines = doc.splitTextToSize(lgpdText, maxW - 6);
  doc.text(lgpdLines, margin + 3, y + 10);
  y += 20;

  // Assinaturas
  if (y > 240) { doc.addPage(); y = 20; }
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');

  const dataFormatada = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  doc.text(`Ribeirão Preto, ${dataFormatada}.`, margin, y); y += 12;

  doc.line(margin, y, margin + 75, y);
  doc.line(margin + 95, y, 210 - margin, y);
  y += 5;
  doc.text(`Paciente: ${patient.full_name}`, margin, y);
  doc.text(`Fisioterapeuta: ${fisio.full_name}`, margin + 95, y);

  return doc;
}
