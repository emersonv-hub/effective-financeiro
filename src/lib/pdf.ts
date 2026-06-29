import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatBRL, formatDate, formatPhone } from './utils';
import type { Patient, Session, Payment, MuscleEvaluation } from '@/types';

export async function exportElementToPDF(elementId: string, filename: string) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const canvas = await html2canvas(el, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const w = pdf.internal.pageSize.getWidth();
  const h = (canvas.height * w) / canvas.width;
  pdf.addImage(imgData, 'PNG', 0, 0, w, h);
  pdf.save(filename);
}

export function exportPatientPDF(patient: Patient, sessions: Session[], payments: Payment[]) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;
  let y = margin;

  // Header
  doc.setFillColor(34, 80, 252);
  doc.rect(0, 0, 210, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('effective FISIOMANAGER', margin, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Ficha do Paciente', 210 - margin, 12, { align: 'right' });

  y = 28;
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(patient.full_name, margin, y);

  y += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Emitido em: ${formatDate(new Date().toISOString())}`, margin, y);

  // Divider
  y += 5;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, 210 - margin, y);

  // Personal data
  y += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 80, 252);
  doc.text('Dados Pessoais', margin, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(9);

  const fields: [string, string | undefined][] = [
    ['CPF', patient.cpf],
    ['Data de Nascimento', patient.birth_date ? formatDate(patient.birth_date) : undefined],
    ['Gênero', patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Feminino' : patient.gender],
    ['Telefone', patient.phone ? formatPhone(patient.phone) : undefined],
    ['E-mail', patient.email],
    ['Endereço', patient.address],
    ['Cidade', patient.city],
    ['Convênio', patient.health_plan],
  ];

  const col1 = fields.slice(0, 4);
  const col2 = fields.slice(4);
  col1.forEach(([label, value], i) => {
    if (!value) return;
    doc.setFont('helvetica', 'bold'); doc.text(label + ':', margin, y + i * 6);
    doc.setFont('helvetica', 'normal'); doc.text(value, margin + 38, y + i * 6);
  });
  col2.forEach(([label, value], i) => {
    if (!value) return;
    doc.setFont('helvetica', 'bold'); doc.text(label + ':', 115, y + i * 6);
    doc.setFont('helvetica', 'normal'); doc.text(value, 115 + 22, y + i * 6);
  });

  y += 30;
  if (patient.diagnosis) {
    doc.setFont('helvetica', 'bold'); doc.text('Diagnóstico:', margin, y);
    doc.setFont('helvetica', 'normal'); doc.text(patient.diagnosis, margin + 28, y);
    y += 6;
  }

  // Sessions summary
  doc.line(margin, y, 210 - margin, y);
  y += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 80, 252);
  doc.text('Sessões', margin, y);

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  const presence = sessions.filter(s => s.status === 'presente').length;
  const absences = sessions.filter(s => s.status.startsWith('faltou')).length;
  doc.text(`Total: ${sessions.length}   Presença: ${presence}   Faltas: ${absences}   Taxa: ${sessions.length > 0 ? Math.round(presence / sessions.length * 100) : 0}%`, margin, y);

  y += 8;
  const recentSessions = sessions.slice(0, 10);
  recentSessions.forEach(s => {
    doc.setFont('helvetica', 'bold'); doc.text(formatDate(s.date), margin, y);
    const statusLabel = s.status === 'presente' ? 'Presente' : s.status === 'faltou' ? 'Faltou' : s.status;
    doc.setFont('helvetica', 'normal'); doc.text(statusLabel, margin + 30, y);
    if (s.session_number) doc.text(`Sessão #${s.session_number}`, margin + 60, y);
    y += 5;
    if (y > 260) { doc.addPage(); y = margin; }
  });

  // Payments summary
  if (payments.length > 0) {
    doc.line(margin, y, 210 - margin, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 80, 252);
    doc.text('Financeiro', margin, y);

    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    const totalPaid = payments.filter(p => p.status === 'pago').reduce((s, p) => s + Number(p.amount), 0);
    doc.text(`Total pago: ${formatBRL(totalPaid)}`, margin, y);
    y += 5;
  }

  doc.save(`ficha-${patient.full_name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

export function exportLaudoPDF(patient: Patient, evaluations: MuscleEvaluation[], fisioName?: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;
  let y = margin;

  // Header
  doc.setFillColor(34, 80, 252);
  doc.rect(0, 0, 210, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('effective FISIOMANAGER', margin, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Laudo de Avaliação Muscular', 210 - margin, 12, { align: 'right' });

  y = 28;
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(patient.full_name, margin, y);

  y += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const meta: string[] = [`Emitido em: ${formatDate(new Date().toISOString())}`];
  if (fisioName) meta.push(`Fisioterapeuta: ${fisioName}`);
  if (patient.diagnosis) meta.push(`Diagnóstico: ${patient.diagnosis}`);
  doc.text(meta.join('   ·   '), margin, y);

  y += 5;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, 210 - margin, y);
  y += 8;

  if (evaluations.length === 0) {
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.text('Nenhuma avaliação muscular registrada.', margin, y);
    doc.save(`laudo-${patient.full_name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    return;
  }

  // Group by date
  const byDate: Record<string, MuscleEvaluation[]> = {};
  evaluations.forEach(e => {
    if (!byDate[e.evaluation_date]) byDate[e.evaluation_date] = [];
    byDate[e.evaluation_date].push(e);
  });

  const colWidths = [52, 18, 16, 18, 18, 18, 22];
  const cols = ['Músculo', 'Lado', 'Unid.', 'Med. 1', 'Med. 2', 'Med. 3', 'Média'];
  const colX = colWidths.reduce<number[]>((acc, w, i) => [...acc, (acc[i - 1] ?? margin) + (i === 0 ? 0 : colWidths[i - 1])], [margin]);

  function drawTableHeader() {
    doc.setFillColor(34, 80, 252);
    doc.rect(margin, y, 170, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    cols.forEach((c, i) => doc.text(c, colX[i] + 2, y + 5));
    y += 8;
  }

  Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([date, rows]) => {
      if (y > 250) { doc.addPage(); y = margin; }

      doc.setTextColor(34, 80, 252);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Avaliação — ${formatDate(date)}`, margin, y);
      y += 5;

      drawTableHeader();

      rows.forEach((ev, idx) => {
        if (y > 270) { doc.addPage(); y = margin; drawTableHeader(); }

        const bg = idx % 2 === 0 ? [248, 249, 252] : [255, 255, 255];
        doc.setFillColor(bg[0], bg[1], bg[2]);
        doc.rect(margin, y - 1, 170, 7, 'F');

        doc.setTextColor(40, 40, 40);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        const sideLabel = ev.side === 'D' ? 'Dir.' : ev.side === 'E' ? 'Esq.' : ev.side === 'BD' ? 'Bil.' : '—';
        const vals = [
          ev.muscle_name,
          sideLabel,
          ev.unit,
          ev.measure_1 != null ? String(ev.measure_1) : '—',
          ev.measure_2 != null ? String(ev.measure_2) : '—',
          ev.measure_3 != null ? String(ev.measure_3) : '—',
          ev.average != null ? String(ev.average) : '—',
        ];

        vals.forEach((v, i) => {
          if (i === cols.length - 1) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(34, 80, 252);
          }
          doc.text(String(v).substring(0, 20), colX[i] + 2, y + 4);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(40, 40, 40);
        });

        if (ev.notes) {
          y += 6;
          doc.setFontSize(7);
          doc.setTextColor(120, 120, 120);
          doc.text(`   Obs: ${ev.notes}`, margin + 2, y + 4);
        }

        y += 7;
      });

      y += 4;
    });

  // Signature
  if (y + 25 > 290) { doc.addPage(); y = margin; }
  y = Math.max(y + 10, 250);
  doc.setDrawColor(180, 180, 180);
  doc.line(margin, y, margin + 60, y);
  y += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  if (fisioName) doc.text(fisioName, margin, y);

  doc.save(`laudo-${patient.full_name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

export async function exportReportPDF(elementId: string, title: string) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  const imgData = canvas.toDataURL('image/png');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();

  doc.setFillColor(34, 80, 252);
  doc.rect(0, 0, w, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('effective FisioManager — ' + title, 10, 10);
  doc.setFontSize(8);
  doc.text(formatDate(new Date().toISOString()), w - 10, 10, { align: 'right' });

  const imgH = (canvas.height * (w - 20)) / canvas.width;
  doc.addImage(imgData, 'PNG', 10, 18, w - 20, Math.min(imgH, 175));
  doc.save(title.toLowerCase().replace(/\s+/g, '-') + '.pdf');
}
