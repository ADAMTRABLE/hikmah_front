import ResourceManager from '../shared/ResourceManager';
import styles from '../shared/admin.module.css';
import type { ColumnConfig, FieldConfig } from '../shared/types';

interface UserRow {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  contact: string | null;
  location: string | null;
  date_of_birth: string | null;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
}

const columns: ColumnConfig<UserRow>[] = [
  {
    key: 'username',
    label: 'User',
    render: (row) => (
      <div>
        <div className={styles.cellTitle}>{row.first_name} {row.last_name}</div>
        <div className={styles.cellMuted}>@{row.username}</div>
      </div>
    ),
  },
  { key: 'email', label: 'Email' },
  { key: 'contact', label: 'Contact', render: (row) => row.contact || <span className={styles.cellMuted}>—</span> },
  { key: 'location', label: 'Location', render: (row) => row.location || <span className={styles.cellMuted}>—</span> },
  {
    key: 'is_staff',
    label: 'Role',
    render: (row) => (
      <span className={`${styles.badge} ${row.is_staff ? styles.badgeApproved : styles.badgeNeutral}`}>
        {row.is_staff ? 'Admin' : 'Student'}
      </span>
    ),
  },
  {
    key: 'is_active',
    label: 'Status',
    render: (row) => (
      <span className={`${styles.badge} ${row.is_active ? styles.badgeActive : styles.badgeInactive}`}>
        {row.is_active ? 'Active' : 'Disabled'}
      </span>
    ),
  },
  {
    key: 'date_joined',
    label: 'Joined',
    render: (row) => new Date(row.date_joined).toLocaleDateString(),
  },
];

const fields: FieldConfig[] = [
  { name: 'first_name', label: 'First Name', type: 'text', required: true },
  { name: 'last_name', label: 'Last Name', type: 'text', required: true },
  { name: 'username', label: 'Username', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'contact', label: 'Contact Phone', type: 'text' },
  { name: 'location', label: 'Location (City, Country)', type: 'text' },
  { name: 'date_of_birth', label: 'Date of Birth', type: 'date' },
  { name: 'password', label: 'Password', type: 'password', required: true, createOnly: true },
  {
    name: 'is_staff',
    label: 'Grant admin access',
    type: 'checkbox',
    fullWidth: true,
  },
  {
    name: 'is_active',
    label: 'Account active',
    type: 'checkbox',
    fullWidth: true,
    defaultValue: true,
  },
];

const UsersAdmin = () => (
  <ResourceManager<UserRow>
    title="Users"
    description="Manage student and admin accounts."
    listUrl="/api/v1/users/"
    getDetailUrl={(id) => `/api/v1/users/${id}/`}
    columns={columns}
    fields={fields}
    searchableKeys={['username', 'email', 'first_name', 'last_name']}
    createLabel="Add User"
    transformBeforeSubmit={(values) => ({ ...values, is_subscribed: false })}
  />
);

export default UsersAdmin;
