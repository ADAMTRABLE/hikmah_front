import { NavLink } from 'react-router-dom';
import styles from './AdminSidebar.module.css';

const navItems = [
  { to: '/admin', label: 'Control Center', icon: 'fa-gauge-high', end: true },
  { to: '/admin/users', label: 'Users', icon: 'fa-users' },
  { to: '/admin/courses', label: 'Courses', icon: 'fa-book-quran' },
  { to: '/admin/library', label: 'Library', icon: 'fa-book' },
  { to: '/admin/events', label: 'Events', icon: 'fa-calendar-days' },
  { to: '/admin/settings', label: 'Subscription', icon: 'fa-crown' },
];

type AdminSidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
}

const AdminSidebar = ({ isOpen = false, onClose }: AdminSidebarProps) => {
  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <NavLink to="/" className={styles.backToSite} onClick={onClose}>
          <i className="fas fa-arrow-left"></i>
          <span>Back to Site</span>
        </NavLink>
      </aside>
    </>
  );
};

export default AdminSidebar;
