import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../services/api';
import ResourceManager from '../shared/ResourceManager';
import styles from '../shared/admin.module.css';
import detailStyles from '../shared/DetailPage.module.css';
import type { ColumnConfig, FieldConfig } from '../shared/types';

interface AssessmentRow {
  id: number;
  course: number;
  topic: number | null;
  name: string;
  assessment_type: 'Test' | 'Exam';
  passmark: number;
  time_limit_minutes: number | null;
  max_attempts: number | null;
  shuffle_questions: boolean;
  assessment_url: string;
  question_count: number;
}

interface TopicOption {
  id: number;
  title: string;
  position: number;
}

interface CourseInfo {
  id: number;
  title: string;
}

const AssessmentsAdmin = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [courseRes, topicsRes] = await Promise.all([
          api.get<CourseInfo>(`/api/v1/courses/${id}/`),
          api.get<TopicOption[]>(`/api/v1/courses/topics/?course=${id}`),
        ]);
        setCourse(courseRes.data);
        setTopics(topicsRes.data);
      } finally {
        setIsReady(true);
      }
    };
    load();
  }, [id]);

  const topicName = (topicId: number | null) => {
    if (!topicId) return 'Whole Course (Exam)';
    return topics.find((t) => t.id === topicId)?.title || `Module #${topicId}`;
  };

  const columns: ColumnConfig<AssessmentRow>[] = [
    { key: 'name', label: 'Name', render: (row) => <span className={styles.cellTitle}>{row.name}</span> },
    {
      key: 'assessment_type', label: 'Type', render: (row) => (
        <span className={`${styles.badge} ${row.assessment_type === 'Exam' ? styles.badgeApproved : styles.badgeNeutral}`}>
          {row.assessment_type}
        </span>
      ),
    },
    { key: 'topic', label: 'Scope', render: (row) => topicName(row.topic) },
    { key: 'question_count', label: 'Questions' },
    { key: 'passmark', label: 'Passmark', render: (row) => `${row.passmark}%` },
    {
      key: 'rules', label: 'Rules', render: (row) => (
        <span className={styles.cellMuted}>
          {row.time_limit_minutes ? `${row.time_limit_minutes} min` : 'Untimed'} · {row.max_attempts ? `${row.max_attempts} attempt${row.max_attempts !== 1 ? 's' : ''}` : 'Unlimited'}
        </span>
      ),
    },
  ];

  const fields: FieldConfig[] = [
    { name: 'name', label: 'Name', type: 'text', required: true, fullWidth: true, placeholder: 'e.g. Module 1 Test, or Final Exam' },
    {
      name: 'assessment_type', label: 'Type', type: 'select', required: true,
      options: [{ value: 'Test', label: 'Test (module)' }, { value: 'Exam', label: 'Exam (whole course)' }],
    },
    {
      name: 'topic', label: 'Scope', type: 'select',
      options: [{ value: '', label: 'Whole Course (Exam)' }, ...topics.map((t) => ({ value: t.id, label: t.title }))],
      helpText: 'Leave as "Whole Course" for a cumulative final exam',
    },
    { name: 'passmark', label: 'Passmark (%)', type: 'number', required: true, placeholder: 'e.g. 60' },
    { name: 'time_limit_minutes', label: 'Time Limit (minutes)', type: 'number', helpText: 'Blank = untimed' },
    { name: 'max_attempts', label: 'Max Attempts', type: 'number', helpText: 'Blank = unlimited' },
    { name: 'shuffle_questions', label: 'Shuffle question order per attempt', type: 'checkbox', fullWidth: true },
    { name: 'assessment_url', label: 'External Link (optional)', type: 'url', fullWidth: true, helpText: 'e.g. a Google Form, if not using the built-in question builder' },
  ];

  return (
    <div className={styles.page}>
      <Link to={`/admin/courses/${id}/builder`} className={detailStyles.backLink}>
        <i className="fas fa-arrow-left"></i> Back to {course?.title || 'Course'}
      </Link>

      <ResourceManager<AssessmentRow>
        title="Assessment"
        description="Module tests and the course-wide final exam."
        listUrl={`/api/v1/courses/assessments/?course=${id}`}
        createUrl="/api/v1/courses/assessments/"
        getDetailUrl={(assessmentId) => `/api/v1/courses/assessments/${assessmentId}/`}
        columns={columns}
        fields={fields}
        searchableKeys={['name']}
        createLabel="Add Assessment"
        isReady={isReady}
        transformBeforeSubmit={(values) => ({
          ...values,
          course: Number(id),
          topic: values.topic ? Number(values.topic) : null,
        })}
        getViewUrl={(row) => `/admin/assessments/${row.id}/questions`}
      />
    </div>
  );
};

export default AssessmentsAdmin;
