import { useEffect, useState } from 'react';
import api from '../../../services/api';
import ResourceManager from '../shared/ResourceManager';
import AdminTabs from '../shared/AdminTabs';
import styles from '../shared/admin.module.css';
import type { ColumnConfig, FieldConfig } from '../shared/types';

interface SheikhRow {
  id: number;
  name: string;
  title: string;
  bio: string;
  avatar_icon: string;
  is_active: boolean;
}

interface EventRow {
  id: number;
  category: 'hikmah' | 'invited';
  event_type: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string;
  status_label: string;
  registration_url: string;
  sheikh: number | null;
  sheikh_name: string;
  is_published: boolean;
}

interface BookingRow {
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
  created_at: string;
}

const sheikhColumns: ColumnConfig<SheikhRow>[] = [
  { key: 'name', label: 'Name', render: (row) => <span className={styles.cellTitle}>{row.name}</span> },
  { key: 'title', label: 'Specialty' },
  {
    key: 'is_active',
    label: 'Status',
    render: (row) => (
      <span className={`${styles.badge} ${row.is_active ? styles.badgeActive : styles.badgeInactive}`}>
        {row.is_active ? 'Active' : 'Inactive'}
      </span>
    ),
  },
];

const sheikhFields: FieldConfig[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'title', label: 'Specialty', type: 'text', placeholder: 'e.g. Fiqh & Contemporary Issues' },
  { name: 'avatar_icon', label: 'Icon (FontAwesome name)', type: 'text', placeholder: 'user' },
  { name: 'bio', label: 'Bio', type: 'textarea', fullWidth: true },
  { name: 'is_active', label: 'Active (available for events/bookings)', type: 'checkbox', fullWidth: true, defaultValue: true },
];

const EventsAdmin = () => {
  const [tab, setTab] = useState('events');
  const [sheikhs, setSheikhs] = useState<SheikhRow[]>([]);
  const [optionsReady, setOptionsReady] = useState(false);

  useEffect(() => {
    const loadSheikhs = async () => {
      try {
        const res = await api.get<SheikhRow[]>('/api/v1/events/sheikhs/');
        setSheikhs(res.data);
      } catch {
        // handled by isReady gating below
      } finally {
        setOptionsReady(true);
      }
    };
    loadSheikhs();
  }, []);

  const sheikhOptions = sheikhs.map((s) => ({ value: s.id, label: s.name }));

  const eventColumns: ColumnConfig<EventRow>[] = [
    { key: 'title', label: 'Title', render: (row) => <span className={styles.cellTitle}>{row.title}</span> },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <span className={`${styles.badge} ${row.category === 'hikmah' ? styles.badgeApproved : styles.badgeNeutral}`}>
          {row.category === 'hikmah' ? 'Hikmah Event' : 'Sheikh Invitation'}
        </span>
      ),
    },
    { key: 'event_type', label: 'Type' },
    { key: 'event_date', label: 'Date', render: (row) => new Date(row.event_date).toLocaleDateString() },
    { key: 'sheikh_name', label: 'Sheikh', render: (row) => row.sheikh_name || <span className={styles.cellMuted}>—</span> },
    {
      key: 'is_published',
      label: 'Status',
      render: (row) => (
        <span className={`${styles.badge} ${row.is_published ? styles.badgeActive : styles.badgeNeutral}`}>
          {row.is_published ? 'Published' : 'Hidden'}
        </span>
      ),
    },
  ];

  const eventFields: FieldConfig[] = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'subtitle', label: 'Subtitle', type: 'text' },
    {
      name: 'category', label: 'Category', type: 'select', required: true,
      options: [{ value: 'hikmah', label: 'Hikmah Event' }, { value: 'invited', label: 'Sheikh Invitation' }],
    },
    { name: 'event_type', label: 'Event Type', type: 'text', placeholder: 'Conference, Workshop, Seminar...' },
    { name: 'icon', label: 'Icon (FontAwesome name)', type: 'text', placeholder: 'calendar' },
    { name: 'event_date', label: 'Date', type: 'date', required: true },
    { name: 'start_time', label: 'Start Time', type: 'time' },
    { name: 'end_time', label: 'End Time', type: 'time' },
    { name: 'location', label: 'Location', type: 'text' },
    { name: 'status_label', label: 'Status Badge', type: 'text', placeholder: 'e.g. Open for Registration' },
    { name: 'registration_url', label: 'Registration URL', type: 'url', fullWidth: true },
    { name: 'sheikh', label: 'Featured Sheikh', type: 'select', options: sheikhOptions },
    { name: 'description', label: 'Description', type: 'textarea', required: true, fullWidth: true },
    { name: 'is_published', label: 'Published (visible on the public Events page)', type: 'checkbox', fullWidth: true, defaultValue: true },
  ];

  const bookingColumns: ColumnConfig<BookingRow>[] = [
    { key: 'event_name', label: 'Event', render: (row) => <span className={styles.cellTitle}>{row.event_name}</span> },
    { key: 'contact_name', label: 'Requested By', render: (row) => <>{row.contact_name}<div className={styles.cellMuted}>{row.contact_email}</div></> },
    { key: 'event_date', label: 'Date', render: (row) => new Date(row.event_date).toLocaleDateString() },
    { key: 'service_type', label: 'Service' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const badgeClass =
          row.status === 'Approved' ? styles.badgeApproved
          : row.status === 'Rejected' ? styles.badgeRejected
          : styles.badgePending;
        return <span className={`${styles.badge} ${badgeClass}`}>{row.status}</span>;
      },
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Events</h1>
          <p>Manage public events, sheikh profiles, and speaker booking requests.</p>
        </div>
      </div>

      <AdminTabs
        tabs={[
          { key: 'events', label: 'Events', icon: 'fa-calendar-days' },
          { key: 'sheikhs', label: 'Sheikhs', icon: 'fa-user' },
          { key: 'bookings', label: 'Booking Requests', icon: 'fa-envelope-open-text' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'events' && (
        <ResourceManager<EventRow>
          title="Event"
          listUrl="/api/v1/events/"
          getDetailUrl={(id) => `/api/v1/events/${id}/`}
          columns={eventColumns}
          fields={eventFields}
          searchableKeys={['title', 'event_type', 'location']}
          createLabel="Add Event"
          isReady={optionsReady}
        />
      )}

      {tab === 'sheikhs' && (
        <ResourceManager<SheikhRow>
          title="Sheikh"
          listUrl="/api/v1/events/sheikhs/"
          getDetailUrl={(id) => `/api/v1/events/sheikhs/${id}/`}
          columns={sheikhColumns}
          fields={sheikhFields}
          searchableKeys={['name', 'title']}
          createLabel="Add Sheikh"
        />
      )}

      {tab === 'bookings' && (
        <ResourceManager<BookingRow>
          title="Booking Request"
          listUrl="/api/v1/events/bookings/"
          getDetailUrl={(id) => `/api/v1/events/bookings/${id}/`}
          columns={bookingColumns}
          fields={[]}
          searchableKeys={['event_name', 'contact_name', 'contact_email']}
          canCreate={false}
          canEdit={false}
          emptyMessage="No booking requests yet."
          getViewUrl={(row) => `/admin/events/bookings/${row.id}`}
        />
      )}
    </div>
  );
};

export default EventsAdmin;
