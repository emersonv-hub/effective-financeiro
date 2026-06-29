import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppointments } from '@/hooks/useAppointments';
import { AppointmentModal } from '@/components/agenda/AppointmentModal';
import type { Appointment } from '@/types';

export default function Agenda() {
  const { appointments, fetchAppointments, createAppointment, updateAppointment } = useAppointments();
  const calendarRef = useRef<FullCalendar>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();
    fetchAppointments(start, end);
  }, []);

  const eventColor = (a: Appointment) => a.color ?? a.fisio?.color ?? '#2250fc';

  const events = appointments.map(a => ({
    id: a.id,
    title: a.patient?.full_name ?? 'Paciente',
    start: a.start_time,
    end: a.end_time,
    backgroundColor: eventColor(a),
    borderColor: eventColor(a),
    textColor: '#ffffff',
    display: 'block',
    extendedProps: { appointment: a },
  }));

  function handleDateClick(info: { date: Date }) {
    const start = info.date;
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    setSelectedSlot({ start, end });
    setSelectedAppt(null);
    setModalOpen(true);
  }

  function handleEventClick(info: { event: { extendedProps: Record<string, unknown> } }) {
    setSelectedAppt(info.event.extendedProps.appointment as Appointment);
    setSelectedSlot(null);
    setModalOpen(true);
  }

  async function handleEventDrop(info: { event: { id: string; start: Date | null; end: Date | null } }) {
    if (!info.event.start || !info.event.end) return;
    await updateAppointment(info.event.id, {
      start_time: info.event.start.toISOString(),
      end_time: info.event.end.toISOString(),
    });
    fetchAppointments();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Filter size={15} className="mr-1" />Filtros</Button>
          <Button size="sm" className="bg-[#2250fc] hover:bg-[#1a3fd4]"
            onClick={() => { setSelectedAppt(null); setSelectedSlot(null); setModalOpen(true); }}>
            <Plus size={15} className="mr-1" />Novo Agendamento
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="timeGridWeek"
          locale={ptBrLocale}
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }}
          events={events}
          editable
          selectable
          height={680}
          slotMinTime="07:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          eventDrop={handleEventDrop}
          nowIndicator
          eventContent={(info) => (
            <div className="p-0.5 overflow-hidden">
              <div className="text-[11px] font-semibold truncate">{info.event.title}</div>
              <div className="text-[10px] opacity-80">{info.timeText}</div>
            </div>
          )}
        />
      </div>

      <AppointmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        appointment={selectedAppt}
        initialSlot={selectedSlot}
        onSave={async (data) => {
          if (selectedAppt) await updateAppointment(selectedAppt.id, data);
          else await createAppointment(data);
          setModalOpen(false);
          const now = new Date();
          fetchAppointments(
            new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
            new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString()
          );
        }}
      />
    </div>
  );
}
