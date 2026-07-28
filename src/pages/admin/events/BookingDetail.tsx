import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../services/api';
import styles from '../shared/admin.module.css';
import detailStyles from '../shared/DetailPage.module.css';

interface BookingDetailRow {
  id: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  organization: string;
  sheikh: number | null;
  event_name: string;
  event_location: string;
  event_date: string;
  start_time: string;
  end_time: string;
  service_type: string;
  theme: string;
  attendees: number;
  expectations: string;
  other_guests: string;
  additional_info: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  status_reason: string;
  published_event: number | null;
  created_at: string;
}

interface SheikhOption {
  id: number;
  name: string;
}

const BookingDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState<BookingDetailRow | null>(null);
  const [sheikhName, setSheikhName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [eventType, setEventType] = useState('Speaking Engagement');
  const [statusLabel, setStatusLabel] = useState('Open for Registration');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedEvent, setPublishedEvent] = useState<{ id: number; title: string } | null>(null);

  const load = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [detailRes, sheikhsRes] = await Promise.all([
        api.get<BookingDetailRow>(`/api/v1/events/bookings/${id}/`),
        api.get<SheikhOption[]>('/api/v1/events/sheikhs/'),
      ]);
      setItem(detailRes.data);
      setStatusReason(detailRes.data.status_reason || '');
      const sheikh = sheikhsRes.data.find((s) => s.id === detailRes.data.sheikh);
      setSheikhName(sheikh ? sheikh.name : '');
    } catch {
      setError('Failed to load this booking request. It may have been deleted.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async (status: 'Approved' | 'Rejected') => {
    setActionError('');
    setIsSaving(true);
    try {
      const res = await api.patch<BookingDetailRow>(`/api/v1/events/bookings/${id}/`, {
        status,
        status_reason: statusReason,
      });
      setItem(res.data);
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: unknown; status?: number } };
      if (anyErr?.response?.status === 401 || anyErr?.response?.status === 403) {
        setActionError('You are not authorized to review booking requests. Please make sure you are logged in as an admin.');
      } else {
        setActionError('Something went wrong updating this booking request. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const saveNotesOnly = async () => {
    setActionError('');
    setIsSaving(true);
    try {
      const res = await api.patch<BookingDetailRow>(`/api/v1/events/bookings/${id}/`, {
        status_reason: statusReason,
      });
      setItem(res.data);
    } catch {
      setActionError('Failed to save notes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setActionError('');
    setIsPublishing(true);
    try {
      const res = await api.post<{ id: number; title: string }>(
        `/api/v1/events/bookings/${id}/publish/`,
        { event_type: eventType, status_label: statusLabel }
      );
      setPublishedEvent(res.data);
      load();
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { error?: string } } };
      setActionError(anyErr?.response?.data?.error || 'Failed to publish this event. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.stateBlock}><i className="fas fa-spinner fa-spin"></i> Loading...</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className={styles.page}>
        <div className={`${styles.stateBlock} ${styles.stateBlockError}`}>
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
        <Link to="/admin/events" className={`${styles.btn} ${styles.btnSecondary}`}>Back to Events</Link>
      </div>
    );
  }

  const badgeClass =
    item.status === 'Approved' ? styles.badgeApproved
    : item.status === 'Rejected' ? styles.badgeRejected
    : styles.badgePending;

  return (
    <div className={styles.page}>
      <Link to="/admin/events" className={detailStyles.backLink}>
        <i className="fas fa-arrow-left"></i> Back to Events
      </Link>

      <div className={styles.pageHeader}>
        <div>
          <h1>{item.event_name}</h1>
          <p>Requested by {item.contact_name} on {new Date(item.created_at).toLocaleDateString()}</p>
        </div>
        <span className={`${styles.badge} ${badgeClass}`} style={{ fontSize: '0.9rem', padding: '8px 18px' }}>
          {item.status}
        </span>
      </div>

      {actionError && <div className={styles.formError}>{actionError}</div>}

      <div className={detailStyles.grid}>
        <div className={`${styles.card} ${detailStyles.mainCard}`}>
          <div className={detailStyles.section}>
            <h3>Event Details</h3>
            <dl className={detailStyles.infoList}>
              <dt>Event Name</dt><dd>{item.event_name}</dd>
              <dt>Location</dt><dd>{item.event_location || '—'}</dd>
              <dt>Date</dt><dd>{new Date(item.event_date).toLocaleDateString()}</dd>
              <dt>Time</dt><dd>{item.start_time} – {item.end_time}</dd>
              <dt>Service Type</dt><dd>{item.service_type}</dd>
              <dt>Theme</dt><dd>{item.theme || '—'}</dd>
              <dt>Expected Attendees</dt><dd>{item.attendees}</dd>
              <dt>Requested Sheikh</dt><dd>{sheikhName || '—'}</dd>
              {item.expectations && (<><dt>Expectations</dt><dd>{item.expectations}</dd></>)}
              {item.other_guests && (<><dt>Other Guests</dt><dd>{item.other_guests}</dd></>)}
              {item.additional_info && (<><dt>Additional Info</dt><dd>{item.additional_info}</dd></>)}
            </dl>
          </div>

          <div className={detailStyles.section}>
            <h3>Contact</h3>
            <dl className={detailStyles.infoList}>
              <dt>Name</dt><dd>{item.contact_name}</dd>
              <dt>Email</dt><dd>{item.contact_email}</dd>
              <dt>Phone</dt><dd>{item.contact_phone}</dd>
              <dt>Organization</dt><dd>{item.organization || '—'}</dd>
            </dl>
          </div>
        </div>

        <div className={`${styles.card} ${detailStyles.sideCard}`}>
          <h3>Review</h3>

          {item.status === 'Pending' && (
            <>
              <div className={styles.field}>
                <label htmlFor="statusReason">Review notes</label>
                <textarea
                  id="statusReason"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Optional — reasoning shared internally about this decision"
                />
              </div>
              <div className={detailStyles.actionStack}>
                <button className={`${styles.btn} ${styles.btnSuccess}`} disabled={isSaving} onClick={() => updateStatus('Approved')}>
                  <i className="fas fa-check"></i> Approve
                </button>
                <button className={`${styles.btn} ${styles.btnDanger}`} disabled={isSaving} onClick={() => updateStatus('Rejected')}>
                  <i className="fas fa-times"></i> Reject
                </button>
                <button className={`${styles.btn} ${styles.btnSecondary}`} disabled={isSaving} onClick={saveNotesOnly}>
                  <i className="fas fa-save"></i> Save Notes Only
                </button>
              </div>
            </>
          )}

          {item.status === 'Rejected' && (
            <>
              <p className={styles.cellMuted}>This booking was rejected{item.status_reason ? `: "${item.status_reason}"` : '.'}</p>
              <div className={detailStyles.actionStack}>
                <button className={`${styles.btn} ${styles.btnSecondary}`} disabled={isSaving} onClick={() => updateStatus('Approved')}>
                  <i className="fas fa-rotate-left"></i> Reconsider &amp; Approve
                </button>
              </div>
            </>
          )}

          {item.status === 'Approved' && !item.published_event && !publishedEvent && (
            <>
              <p className={styles.cellMuted}>Approved. Publish it as a public event on the Events page.</p>
              <div className={styles.field}>
                <label htmlFor="eventType">Event Type</label>
                <input id="eventType" type="text" value={eventType} onChange={(e) => setEventType(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label htmlFor="statusLabel">Status Badge</label>
                <input id="statusLabel" type="text" value={statusLabel} onChange={(e) => setStatusLabel(e.target.value)} />
              </div>
              <div className={detailStyles.actionStack}>
                <button className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPublishing} onClick={handlePublish}>
                  {isPublishing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-globe"></i>}
                  Publish as Event
                </button>
                <button className={`${styles.btn} ${styles.btnSecondary}`} disabled={isSaving} onClick={() => updateStatus('Rejected')}>
                  <i className="fas fa-times"></i> Reject Instead
                </button>
              </div>
            </>
          )}

          {(item.published_event || publishedEvent) && (
            <div className={detailStyles.actionStack}>
              <p className={styles.cellMuted}><i className="fas fa-check-circle" style={{ color: 'var(--a-success)' }}></i> Published to Events.</p>
              <Link to="/admin/events" className={`${styles.btn} ${styles.btnSecondary}`}>
                <i className="fas fa-calendar-days"></i> View in Events
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
