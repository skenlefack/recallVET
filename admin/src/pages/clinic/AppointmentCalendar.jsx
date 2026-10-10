import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Form } from 'react-bootstrap';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { api, getToken } from '../../services/api';

const STATUS_COLORS = {
  scheduled: '#0d6efd',
  confirmed: '#198754',
  checked_in: '#fd7e14',
  completed: '#6c757d',
  cancelled: '#dc3545',
  no_show: '#212529'
};

const AppointmentCalendar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = getToken();

  const [events, setEvents] = useState([]);
  const [vets, setVets] = useState([]);
  const [selectedVet, setSelectedVet] = useState('');
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [toast, setToast] = useState(null);

  const fetchVets = useCallback(async () => {
    const res = await api.get('/v1/team', token);
    if (res.success) {
      const vetMembers = (res.data || []).filter(
        m => m.role === 'vet' || m.role === 'owner' || m.role === 'admin'
      );
      setVets(vetMembers);
    }
  }, [token]);

  useEffect(() => {
    fetchVets();
  }, [fetchVets]);

  const fetchAppointments = useCallback(async (start, end) => {
    if (!start || !end) return;
    setLoading(true);
    let endpoint = `/v1/clinic/appointments?date_from=${start}&date_to=${end}&limit=500`;
    if (selectedVet) endpoint += `&vet_id=${selectedVet}`;
    const res = await api.get(endpoint, token);
    if (res.success) {
      const mapped = (res.data || []).map(apt => ({
        id: String(apt.id),
        title: `${apt.animal_name || ''} - ${apt.party_name || apt.owner_name || ''}`.trim(),
        start: apt.date_time || apt.start_time || apt.date,
        end: apt.end_time || undefined,
        backgroundColor: STATUS_COLORS[apt.status] || STATUS_COLORS.scheduled,
        borderColor: STATUS_COLORS[apt.status] || STATUS_COLORS.scheduled,
        extendedProps: { status: apt.status, appointmentId: apt.id }
      }));
      setEvents(mapped);
    }
    setLoading(false);
  }, [token, selectedVet]);

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      fetchAppointments(dateRange.start, dateRange.end);
    }
  }, [dateRange, fetchAppointments]);

  const handleDatesSet = (arg) => {
    const start = arg.startStr.split('T')[0];
    const end = arg.endStr.split('T')[0];
    setDateRange({ start, end });
  };

  const handleEventClick = (info) => {
    const id = info.event.extendedProps.appointmentId || info.event.id;
    navigate(`/clinic/appointments/${id}`);
  };

  const handleDateClick = (info) => {
    navigate(`/clinic/appointments/new?date=${info.dateStr}`);
  };

  const handleEventDrop = async (info) => {
    const appointmentId = info.event.extendedProps.appointmentId || info.event.id;
    const newDate = info.event.start.toISOString().split('T')[0];
    const res = await api.put(`/v1/clinic/appointments/${appointmentId}`, { scheduled_date: newDate }, token);
    if (res.success) {
      setToast({ type: 'success', message: 'Rendez-vous déplacé avec succès' });
    } else {
      info.revert();
      setToast({ type: 'danger', message: res.message || 'Erreur lors du déplacement' });
    }
  };

  const handleEventResize = async (info) => {
    const appointmentId = info.event.extendedProps.appointmentId || info.event.id;
    const payload = { scheduled_date: info.event.start.toISOString().split('T')[0] };
    if (info.event.end) {
      payload.end_time = info.event.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    const res = await api.put(`/v1/clinic/appointments/${appointmentId}`, payload, token);
    if (!res.success) {
      info.revert();
      setToast({ type: 'danger', message: res.message || 'Erreur lors de la modification' });
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="rv-breadcrumb">
        <Link to="/dashboard">Accueil</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <Link to="/clinic/appointments">Clinique</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Calendrier</span>
      </div>
      <div className="page-title-bar">
        <h4><i className="fas fa-calendar-alt me-2" />{t('calendar.title')}</h4>
        <Form.Select
          style={{ width: 250 }}
          value={selectedVet}
          onChange={e => setSelectedVet(e.target.value)}
        >
          <option value="">{t('calendar.allVets')}</option>
          {vets.map(v => (
            <option key={v.user_id || v.id} value={v.user_id || v.id}>
              {v.first_name} {v.last_name}
            </option>
          ))}
        </Form.Select>
      </div>


      {toast && (
        <div className={`alert alert-${toast.type} alert-dismissible fade show position-fixed`}
          style={{ top: 20, right: 20, zIndex: 9999, minWidth: 300 }}>
          {toast.message}
          <button className="btn-close" onClick={() => setToast(null)}></button>
        </div>
      )}

      <Card>
        <Card.Body>
          {loading && (
            <div className="text-center py-2">
              <div className="spinner-border spinner-border-sm text-success" />
            </div>
          )}

          <div className="mb-3 d-flex gap-3 flex-wrap">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <span key={status} className="d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: color, display: 'inline-block' }} />
                {t(`calendar.status.${status}`)}
              </span>
            ))}
          </div>

          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            datesSet={handleDatesSet}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            editable={true}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            selectable={true}
            height="auto"
            locale={localStorage.getItem('i18nextLng') === 'fr' ? 'fr' : 'en'}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default AppointmentCalendar;
