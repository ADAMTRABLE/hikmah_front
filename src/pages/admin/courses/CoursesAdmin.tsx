import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { getMediaUrl } from '../../../utils/media';
import ResourceManager from '../shared/ResourceManager';
import AdminTabs from '../shared/AdminTabs';
import styles from '../shared/admin.module.css';
import type { ColumnConfig, FieldConfig } from '../shared/types';

interface CategoryRow {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  course_count: number;
}

interface CourseRow {
  id: number;
  title: string;
  category: number | null;
  category_name: string;
  description: string;
  long_description: string;
  duration: string;
  rating: string;
  icon: string;
  tag: string;
  cover_image: string | null;
  instructor: number;
  instructor_name: string;
  created_at: string;
}

interface UserOption {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

const categoryColumns: ColumnConfig<CategoryRow>[] = [
  { key: 'name', label: 'Category', render: (row) => <span className={styles.cellTitle}>{row.name}</span> },
  { key: 'slug', label: 'Slug', render: (row) => <span className={styles.cellMuted}>{row.slug}</span> },
  { key: 'course_count', label: 'Courses' },
];

const categoryFields: FieldConfig[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text', required: true, helpText: 'URL-friendly, e.g. quranic-arabic' },
  { name: 'icon', label: 'Icon (FontAwesome name)', type: 'text', placeholder: 'book' },
  { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
];

const CoursesAdmin = () => {
  const [tab, setTab] = useState('courses');
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [instructors, setInstructors] = useState<UserOption[]>([]);
  const [optionsReady, setOptionsReady] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [catRes, userRes] = await Promise.all([
          api.get<CategoryRow[]>('/api/v1/courses/categories/'),
          api.get<UserOption[]>('/api/v1/users/'),
        ]);
        setCategories(catRes.data);
        setInstructors(userRes.data);
      } catch {
        // options failing to load just means selects are empty; the manager below still functions
      } finally {
        setOptionsReady(true);
      }
    };
    loadOptions();
  }, []);

  const courseColumns: ColumnConfig<CourseRow>[] = [
    {
      key: 'cover_image', label: '', render: (row) => (
        row.cover_image
          ? <img src={getMediaUrl(row.cover_image)} alt="" style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 4 }} />
          : <div style={{ width: 48, height: 32, borderRadius: 4, background: 'var(--a-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--a-text-light)' }}><i className="fas fa-image" style={{ fontSize: '0.75rem' }}></i></div>
      ),
    },
    { key: 'title', label: 'Course', render: (row) => <span className={styles.cellTitle}>{row.title}</span> },
    { key: 'category_name', label: 'Category', render: (row) => row.category_name || <span className={styles.cellMuted}>—</span> },
    { key: 'instructor_name', label: 'Instructor' },
    { key: 'duration', label: 'Duration' },
    { key: 'tag', label: 'Tag', render: (row) => row.tag || <span className={styles.cellMuted}>—</span> },
  ];

  const courseFields: FieldConfig[] = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'cover_image', label: 'Cover Image', type: 'file', fullWidth: true, helpText: 'Recommended: 800x450px (16:9). Shown on the course card.' },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: categories.map((c) => ({ value: c.id, label: c.name })),
    },
    {
      name: 'instructor',
      label: 'Instructor',
      type: 'select',
      required: true,
      options: instructors.map((u) => ({ value: u.id, label: `${u.first_name} ${u.last_name}`.trim() || u.username })),
    },
    { name: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g. 12 weeks' },
    { name: 'rating', label: 'Rating', type: 'text', placeholder: 'e.g. 4.8' },
    { name: 'icon', label: 'Icon (FontAwesome name)', type: 'text', placeholder: 'book-quran' },
    { name: 'tag', label: 'Badge Tag', type: 'text', placeholder: 'e.g. Popular' },
    { name: 'description', label: 'Short Description', type: 'textarea', required: true, fullWidth: true },
    { name: 'long_description', label: 'Long Description', type: 'textarea', fullWidth: true },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Courses</h1>
          <p>Manage course categories and the courses shown to students.</p>
        </div>
      </div>

      <AdminTabs
        tabs={[
          { key: 'courses', label: 'Courses', icon: 'fa-book-quran' },
          { key: 'categories', label: 'Categories', icon: 'fa-tags' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'courses' && (
        <ResourceManager<CourseRow>
          title="Course"
          listUrl="/api/v1/courses/"
          getDetailUrl={(id) => `/api/v1/courses/${id}/`}
          columns={courseColumns}
          fields={courseFields}
          searchableKeys={['title', 'category_name', 'instructor_name']}
          createLabel="Add Course"
          isReady={optionsReady}
          getViewUrl={(row) => `/admin/courses/${row.id}/builder`}
        />
      )}

      {tab === 'categories' && (
        <ResourceManager<CategoryRow>
          title="Category"
          listUrl="/api/v1/courses/categories/"
          getDetailUrl={(id) => `/api/v1/courses/categories/${id}/`}
          columns={categoryColumns}
          fields={categoryFields}
          searchableKeys={['name', 'slug']}
          createLabel="Add Category"
        />
      )}
    </div>
  );
};

export default CoursesAdmin;
