import styles from './admin.module.css';

interface Tab {
  key: string;
  label: string;
  icon?: string;
}

interface AdminTabsProps {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}

const tabBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  marginBottom: '20px',
  borderBottom: '1px solid var(--a-border)',
  flexWrap: 'wrap',
};

const tabBtnStyle = (isActive: boolean): React.CSSProperties => ({
  padding: '12px 18px',
  background: 'none',
  border: 'none',
  borderBottom: isActive ? '3px solid var(--a-primary)' : '3px solid transparent',
  color: isActive ? 'var(--a-primary)' : 'var(--a-text-light)',
  fontWeight: 600,
  fontSize: '0.92rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const AdminTabs = ({ tabs, active, onChange }: AdminTabsProps) => (
  <div style={tabBarStyle} className={styles.card} data-tabbar>
    {tabs.map((tab) => (
      <button key={tab.key} style={tabBtnStyle(active === tab.key)} onClick={() => onChange(tab.key)}>
        {tab.icon && <i className={`fas ${tab.icon}`}></i>}
        {tab.label}
      </button>
    ))}
  </div>
);

export default AdminTabs;
