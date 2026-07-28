import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import styles from './Dashboard.module.css';
import adminStyles from '../shared/admin.module.css';

interface Stats {
  users: number;
  courses: number;
  libraryResources: number;
  pendingSubmissions: number;
  upcomingEvents: number;
  pendingBookings: number;
}

const initialStats: Stats = {
  users: 0,
  courses: 0,
  libraryResources: 0,
  pendingSubmissions: 0,
  upcomingEvents: 0,
  pendingBookings: 0,
};

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>(initialStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        setError('');
        const [users, courses, resources, submissions, events, bookings] = await Promise.all([
          api.get('/api/v1/users/'),
          api.get('/api/v1/courses/'),
          api.get('/api/v1/library/resources/'),
          api.get('/api/v1/library/submissions/'),
          api.get('/api/v1/events/'),
          api.get('/api/v1/events/bookings/'),
        ]);

        const today = new Date();
        const upcoming = (events.data as { event_date: string }[]).filter(
          (e) => new Date(e.event_date) >= new Date(today.toDateString())
        );

        setStats({
          users: (users.data as unknown[]).length,
          courses: (courses.data as unknown[]).length,
          libraryResources: (resources.data as unknown[]).length,
          pendingSubmissions: (submissions.data as { status: string }[]).filter((s) => s.status === 'Pending').length,
          upcomingEvents: upcoming.length,
          pendingBookings: (bookings.data as { status: string }[]).filter((b) => b.status === 'Pending').length,
        });
      } catch {
        setError('Some dashboard data failed to load. Try refreshing.');
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.users, icon: 'fa-users', to: '/admin/users', color: '#1a5e63' },
    { label: 'Courses', value: stats.courses, icon: 'fa-book-quran', to: '/admin/courses', color: '#5cb4b8' },
    { label: 'Library Resources', value: stats.libraryResources, icon: 'fa-book', to: '/admin/library', color: '#d4af37' },
    { label: 'Pending Submissions', value: stats.pendingSubmissions, icon: 'fa-inbox', to: '/admin/library', color: '#e67e22', highlight: stats.pendingSubmissions > 0 },
    { label: 'Upcoming Events', value: stats.upcomingEvents, icon: 'fa-calendar-days', to: '/admin/events', color: '#1a5e63' },
    { label: 'Pending Booking Requests', value: stats.pendingBookings, icon: 'fa-envelope-open-text', to: '/admin/events', color: '#e67e22', highlight: stats.pendingBookings > 0 },
  ];

  return (
    <div className={adminStyles.page}>
      <div className={adminStyles.pageHeader}>
        <div>
          <h1>Control Center</h1>
          <p>An overview of everything happening across Hikmah Online School.</p>
        </div>
      </div>

      {isLoading && (
        <div className={adminStyles.stateBlock}>
          <i className="fas fa-spinner fa-spin"></i>
          Loading dashboard...
        </div>
      )}

      {!isLoading && error && (
        <div className={`${adminStyles.stateBlock} ${adminStyles.stateBlockError}`}>
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {!isLoading && (
        <>
          <div className={styles.statsGrid}>
            {cards.map((card) => (
              <Link to={card.to} key={card.label} className={`${styles.statCard} ${card.highlight ? styles.statCardHighlight : ''}`}>
                <div className={styles.statIcon} style={{ background: `${card.color}1a`, color: card.color }}>
                  <i className={`fas ${card.icon}`}></i>
                </div>
                <div>
                  <div className={styles.statValue}>{card.value}</div>
                  <div className={styles.statLabel}>{card.label}</div>
                </div>
              </Link>
            ))}
          </div>

          <div className={styles.quickLinksCard}>
            <h3>Quick Actions</h3>
            <div className={styles.quickLinksGrid}>
              <Link to="/admin/courses" className={styles.quickLink}><i className="fas fa-plus"></i> Add a Course</Link>
              <Link to="/admin/library" className={styles.quickLink}><i className="fas fa-plus"></i> Add a Library Resource</Link>
              <Link to="/admin/events" className={styles.quickLink}><i className="fas fa-plus"></i> Add an Event</Link>
              <Link to="/admin/users" className={styles.quickLink}><i className="fas fa-user-plus"></i> Add a User</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
