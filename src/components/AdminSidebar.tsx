import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './AdminSidebar.module.css';

const navItems = [
  { to: '/admin', label: 'Control Center', icon: 'fa-gauge-high', end: true },
  { to: '/admin/users', label: 'Users', icon: 'fa-users' },
  { to: '/admin/courses', label: 'Courses', icon: 'fa-book-quran' },
  { to: '/admin/library', label: 'Library', icon: 'fa-book' },
  { to: '/admin/events', label: 'Events', icon: 'fa-calendar-days' },
  { to: '/admin/settings', label: 'Subscription', icon: 'fa-crown' },
];

const AdminSidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the drawer automatically whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile-only toggle button, fixed to the top-left corner */}
      <button
        className={styles.menuToggle}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Close admin menu' : 'Open admin menu'}
        aria-expanded={open}
      >
        <i className={`fas ${open ? 'fa-xmark' : 'fa-bars'}`}></i>
      </button>

      {/* Overlay behind the drawer on mobile */}
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <NavLink to="/" className={styles.backToSite}>
          <i className="fas fa-arrow-left"></i>
          <span>Back to Site</span>
        </NavLink>
      </aside>
    </>
  );
};

export default AdminSidebar;
