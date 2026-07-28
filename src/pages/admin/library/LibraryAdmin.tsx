import { useEffect, useState } from 'react';
import ResourceManager from '../shared/ResourceManager';
import AdminTabs from '../shared/AdminTabs';
import styles from '../shared/admin.module.css';
import api from '../../../services/api';
import type { ColumnConfig, FieldConfig, FieldOption } from '../shared/types';

interface LibraryResourceRow {
  id: number;
  category: string;
  subcategory: string;
  title: string;
  description: string;
  author_name: string;
  author_initials: string;
  resource_type: string;
  icon: string;
  url: string;
  duration: string;
  views: string;
  listens: string;
  pages: string;
  downloads: string;
  is_published: boolean;
  created_at: string;
}

interface LibrarySubmissionRow {
  id: number;
  resource_title: string;
  resource_author: string;
  resource_type: string;
  resource_category: string;
  resource_description: string;
  file: string | null;
  contact_email: string;
  contact_phone: string;
  additional_notes: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  status_reason: string;
  created_at: string;
}

interface LibraryMeta {
  categories: FieldOption[];
  resource_types: FieldOption[];
}

const resourceColumns: ColumnConfig<LibraryResourceRow>[] = [
  { key: 'title', label: 'Title', render: (row) => <span className={styles.cellTitle}>{row.title}</span> },
  { key: 'category', label: 'Category' },
  { key: 'subcategory', label: 'Subcategory', render: (row) => row.subcategory || <span className={styles.cellMuted}>—</span> },
  { key: 'resource_type', label: 'Type' },
  { key: 'author_name', label: 'Author' },
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

const submissionColumns: ColumnConfig<LibrarySubmissionRow>[] = [
  { key: 'resource_title', label: 'Title', render: (row) => <span className={styles.cellTitle}>{row.resource_title}</span> },
  { key: 'resource_author', label: 'Author' },
  { key: 'resource_category', label: 'Category' },
  { key: 'contact_email', label: 'Contact', render: (row) => <span className={styles.cellMuted}>{row.contact_email}</span> },
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
  {
    key: 'created_at',
    label: 'Submitted',
    render: (row) => new Date(row.created_at).toLocaleDateString(),
  },
];

const LibraryAdmin = () => {
  const [tab, setTab] = useState('resources');
  const [meta, setMeta] = useState<LibraryMeta>({ categories: [], resource_types: [] });
  const [metaReady, setMetaReady] = useState(false);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const res = await api.get<LibraryMeta>('/api/v1/library/meta/');
        setMeta(res.data);
      } catch {
        // ResourceManager below is gated on metaReady, so selects just stay empty on failure
      } finally {
        setMetaReady(true);
      }
    };
    loadMeta();
  }, []);

  const resourceFields: FieldConfig[] = [
    { name: 'title', label: 'Title', type: 'text', required: true, fullWidth: true },
    { name: 'category', label: 'Category', type: 'select', required: true, options: meta.categories },
    {
      name: 'subcategory', label: 'Subcategory', type: 'text',
      placeholder: 'Surah name (for Quran) or tab e.g. Topics, Deep Dives',
    },
    { name: 'resource_type', label: 'Type', type: 'select', required: true, options: meta.resource_types },
    { name: 'url', label: 'Resource URL', type: 'url', required: true, fullWidth: true },
    { name: 'author_name', label: 'Author Name', type: 'text', required: true },
    { name: 'author_initials', label: 'Author Initials', type: 'text', placeholder: 'e.g. IA' },
    { name: 'icon', label: 'Icon (FontAwesome name)', type: 'text', placeholder: 'play-circle' },
    { name: 'duration', label: 'Duration (video/audio)', type: 'text', placeholder: 'e.g. 45m' },
    { name: 'views', label: 'Views (video)', type: 'text', placeholder: 'e.g. 1.2K' },
    { name: 'listens', label: 'Listens (audio)', type: 'text', placeholder: 'e.g. 980' },
    { name: 'pages', label: 'Pages (pdf/book)', type: 'text', placeholder: 'e.g. 25 Pages' },
    { name: 'downloads', label: 'Downloads (pdf/book)', type: 'text', placeholder: 'e.g. 845 Downloads' },
    { name: 'description', label: 'Description', type: 'textarea', required: true, fullWidth: true },
    { name: 'is_published', label: 'Published (visible on the public Library page)', type: 'checkbox', fullWidth: true, defaultValue: true },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Library</h1>
          <p>Manage published resources and review community submissions.</p>
        </div>
      </div>

      <AdminTabs
        tabs={[
          { key: 'resources', label: 'Resources', icon: 'fa-book' },
          { key: 'submissions', label: 'Submissions', icon: 'fa-inbox' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'resources' && (
        <ResourceManager<LibraryResourceRow>
          title="Resource"
          listUrl="/api/v1/library/resources/"
          getDetailUrl={(id) => `/api/v1/library/resources/${id}/`}
          columns={resourceColumns}
          fields={resourceFields}
          searchableKeys={['title', 'author_name', 'category']}
          createLabel="Add Resource"
          isReady={metaReady}
        />
      )}

      {tab === 'submissions' && (
        <ResourceManager<LibrarySubmissionRow>
          title="Submission"
          listUrl="/api/v1/library/submissions/"
          getDetailUrl={(id) => `/api/v1/library/submissions/${id}/`}
          columns={submissionColumns}
          fields={[]}
          searchableKeys={['resource_title', 'resource_author', 'contact_email']}
          canCreate={false}
          canEdit={false}
          emptyMessage="No community submissions yet."
          getViewUrl={(row) => `/admin/library/submissions/${row.id}`}
        />
      )}
    </div>
  );
};

export default LibraryAdmin;
