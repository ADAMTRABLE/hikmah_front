import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../services/api';
import styles from '../shared/admin.module.css';
import detailStyles from '../shared/DetailPage.module.css';

interface LessonResource {
  id: number;
  subtopic: number;
  title: string;
  url: string;
  resource_format: 'video' | 'audio' | 'pdf';
  position: number;
}

interface Lesson {
  id: number;
  topic: number;
  title: string;
  description: string;
  position: number;
  resources: LessonResource[];
}

interface Module {
  id: number;
  course: number;
  title: string;
  description: string;
  position: number;
  subtopics: Lesson[];
}

interface CourseInfo {
  id: number;
  title: string;
}

type ModalMode =
  | { kind: 'module'; action: 'create' }
  | { kind: 'module'; action: 'edit'; data: Module }
  | { kind: 'lesson'; action: 'create'; topicId: number }
  | { kind: 'lesson'; action: 'edit'; data: Lesson }
  | { kind: 'resource'; action: 'create'; subtopicId: number }
  | { kind: 'resource'; action: 'edit'; data: LessonResource };

const RESOURCE_FORMAT_OPTIONS = [
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'pdf', label: 'PDF' },
];

const CourseBuilder = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set());

  const [modal, setModal] = useState<ModalMode | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [courseRes, topicsRes] = await Promise.all([
        api.get<CourseInfo>(`/api/v1/courses/${id}/`),
        api.get<Module[]>(`/api/v1/courses/topics/?course=${id}`),
      ]);
      setCourse(courseRes.data);
      setModules(topicsRes.data);
    } catch {
      setError('Failed to load this course.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const toggleLesson = (lessonId: number) => {
    setExpandedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  };

  const openModal = (m: ModalMode) => {
    setFormError('');
    if (m.kind === 'module') {
      setFormValues(m.action === 'edit'
        ? { title: m.data.title, description: m.data.description, position: m.data.position }
        : { title: '', description: '', position: modules.length + 1 });
    } else if (m.kind === 'lesson') {
      setFormValues(m.action === 'edit'
        ? { title: m.data.title, description: m.data.description, position: m.data.position }
        : { title: '', description: '', position: 1 });
    } else {
      setFormValues(m.action === 'edit'
        ? { title: m.data.title, url: m.data.url, resource_format: m.data.resource_format, position: m.data.position }
        : { title: '', url: '', resource_format: 'video', position: 1 });
    }
    setModal(m);
  };

  const closeModal = () => {
    if (isSaving) return;
    setModal(null);
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!window.confirm('Delete this module and all its lessons? This cannot be undone.')) return;
    await api.delete(`/api/v1/courses/topics/${moduleId}/`);
    load();
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!window.confirm('Delete this lesson and its resources? This cannot be undone.')) return;
    await api.delete(`/api/v1/courses/subtopics/${lessonId}/`);
    load();
  };

  const handleDeleteResource = async (resourceId: number) => {
    if (!window.confirm('Delete this resource? This cannot be undone.')) return;
    await api.delete(`/api/v1/courses/subtopic-resources/${resourceId}/`);
    load();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!modal) return;
    setIsSaving(true);
    setFormError('');
    try {
      if (modal.kind === 'module') {
        if (modal.action === 'create') {
          await api.post('/api/v1/courses/topics/', { ...formValues, course: Number(id) });
        } else {
          await api.patch(`/api/v1/courses/topics/${modal.data.id}/`, formValues);
        }
      } else if (modal.kind === 'lesson') {
        if (modal.action === 'create') {
          await api.post('/api/v1/courses/subtopics/', { ...formValues, topic: modal.topicId });
        } else {
          await api.patch(`/api/v1/courses/subtopics/${modal.data.id}/`, formValues);
        }
      } else {
        if (modal.action === 'create') {
          await api.post('/api/v1/courses/subtopic-resources/', { ...formValues, subtopic: modal.subtopicId });
        } else {
          await api.patch(`/api/v1/courses/subtopic-resources/${modal.data.id}/`, formValues);
        }
      }
      setModal(null);
      load();
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: unknown } };
      const data = anyErr?.response?.data;
      setFormError(
        data && typeof data === 'object'
          ? Object.entries(data as Record<string, unknown>).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : String(v)}`).join(' | ')
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className={styles.page}><div className={styles.stateBlock}><i className="fas fa-spinner fa-spin"></i> Loading...</div></div>;
  }

  if (error || !course) {
    return (
      <div className={styles.page}>
        <div className={`${styles.stateBlock} ${styles.stateBlockError}`}><i className="fas fa-exclamation-circle"></i> {error}</div>
        <Link to="/admin/courses" className={`${styles.btn} ${styles.btnSecondary}`}>Back to Courses</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link to="/admin/courses" className={detailStyles.backLink}>
        <i className="fas fa-arrow-left"></i> Back to Courses
      </Link>

      <div className={styles.pageHeader}>
        <div>
          <h1>{course.title}</h1>
          <p>Build out the modules, lessons, and resources students will see for this course.</p>
        </div>
        <div className={styles.headerActions}>
          <Link to={`/admin/courses/${id}/assessments`} className={`${styles.btn} ${styles.btnSecondary}`}>
            <i className="fas fa-file-circle-check"></i> Assessments
          </Link>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => openModal({ kind: 'module', action: 'create' })}>
            <i className="fas fa-plus"></i> Add Module
          </button>
        </div>
      </div>

      {modules.length === 0 && (
        <div className={`${styles.card} ${styles.stateBlock}`}>
          <i className="fas fa-layer-group"></i>
          No modules yet. Start by adding the first module for this course.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {modules.map((mod) => (
          <div className={styles.card} key={mod.id}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer' }} onClick={() => toggleModule(mod.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className={`fas fa-chevron-${expandedModules.has(mod.id) ? 'down' : 'right'}`} style={{ color: 'var(--a-text-light)', fontSize: '0.8rem' }}></i>
                <div>
                  <div className={styles.cellTitle}>Module {mod.position}: {mod.title}</div>
                  <div className={styles.cellMuted}>{mod.subtopics.length} lesson{mod.subtopics.length !== 1 ? 's' : ''}</div>
                </div>
              </div>
              <div className={styles.rowActions} onClick={(e) => e.stopPropagation()}>
                <button className={`${styles.btn} ${styles.btnIcon}`} title="Add Lesson" onClick={() => openModal({ kind: 'lesson', action: 'create', topicId: mod.id })}>
                  <i className="fas fa-plus"></i>
                </button>
                <button className={`${styles.btn} ${styles.btnIcon}`} title="Edit Module" onClick={() => openModal({ kind: 'module', action: 'edit', data: mod })}>
                  <i className="fas fa-pen"></i>
                </button>
                <button className={`${styles.btn} ${styles.btnIcon}`} title="Delete Module" onClick={() => handleDeleteModule(mod.id)}>
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>

            {expandedModules.has(mod.id) && (
              <div style={{ borderTop: '1px solid var(--a-border)', padding: '4px 20px 16px 48px' }}>
                {mod.subtopics.length === 0 && (
                  <p className={styles.cellMuted} style={{ padding: '12px 0' }}>No lessons in this module yet.</p>
                )}
                {mod.subtopics.map((lesson) => (
                  <div key={lesson.id} style={{ borderBottom: '1px solid var(--a-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', cursor: 'pointer' }} onClick={() => toggleLesson(lesson.id)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className={`fas fa-chevron-${expandedLessons.has(lesson.id) ? 'down' : 'right'}`} style={{ color: 'var(--a-text-light)', fontSize: '0.75rem' }}></i>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Lesson {lesson.position}: {lesson.title}</div>
                          <div className={styles.cellMuted}>{lesson.resources.length} resource{lesson.resources.length !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                      <div className={styles.rowActions} onClick={(e) => e.stopPropagation()}>
                        <button className={`${styles.btn} ${styles.btnIcon} ${styles.btnSm}`} title="Add Resource" onClick={() => openModal({ kind: 'resource', action: 'create', subtopicId: lesson.id })}>
                          <i className="fas fa-plus"></i>
                        </button>
                        <button className={`${styles.btn} ${styles.btnIcon} ${styles.btnSm}`} title="Edit Lesson" onClick={() => openModal({ kind: 'lesson', action: 'edit', data: lesson })}>
                          <i className="fas fa-pen"></i>
                        </button>
                        <button className={`${styles.btn} ${styles.btnIcon} ${styles.btnSm}`} title="Delete Lesson" onClick={() => handleDeleteLesson(lesson.id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>

                    {expandedLessons.has(lesson.id) && (
                      <div style={{ padding: '0 0 14px 24px' }}>
                        {lesson.resources.length === 0 && (
                          <p className={styles.cellMuted}>No resources attached to this lesson yet.</p>
                        )}
                        {lesson.resources.map((res) => (
                          <div key={res.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <i className={`fas fa-${res.resource_format === 'video' ? 'circle-play' : res.resource_format === 'audio' ? 'headphones' : 'file-pdf'}`} style={{ color: 'var(--a-primary)' }}></i>
                              <a href={res.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.88rem', color: 'var(--a-text)' }}>{res.title}</a>
                            </div>
                            <div className={styles.rowActions}>
                              <button className={`${styles.btn} ${styles.btnIcon} ${styles.btnSm}`} title="Edit Resource" onClick={() => openModal({ kind: 'resource', action: 'edit', data: res })}>
                                <i className="fas fa-pen"></i>
                              </button>
                              <button className={`${styles.btn} ${styles.btnIcon} ${styles.btnSm}`} title="Delete Resource" onClick={() => handleDeleteResource(res.id)}>
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {modal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                {modal.action === 'create' ? 'Add ' : 'Edit '}
                {modal.kind === 'module' ? 'Module' : modal.kind === 'lesson' ? 'Lesson' : 'Resource'}
              </h3>
              <button className={styles.modalClose} onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                {formError && <div className={styles.formError}>{formError}</div>}

                <div className={styles.field}>
                  <label>Title *</label>
                  <input
                    type="text"
                    required
                    value={formValues.title as string}
                    onChange={(e) => setFormValues((p) => ({ ...p, title: e.target.value }))}
                  />
                </div>

                {(modal.kind === 'module' || modal.kind === 'lesson') && (
                  <div className={styles.field}>
                    <label>Description</label>
                    <textarea
                      value={(formValues.description as string) || ''}
                      onChange={(e) => setFormValues((p) => ({ ...p, description: e.target.value }))}
                    />
                  </div>
                )}

                {modal.kind === 'resource' && (
                  <>
                    <div className={styles.field}>
                      <label>Resource URL *</label>
                      <input
                        type="url"
                        required
                        value={formValues.url as string}
                        onChange={(e) => setFormValues((p) => ({ ...p, url: e.target.value }))}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Format *</label>
                      <select
                        required
                        value={formValues.resource_format as string}
                        onChange={(e) => setFormValues((p) => ({ ...p, resource_format: e.target.value }))}
                      >
                        {RESOURCE_FORMAT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className={styles.field}>
                  <label>Position (display order)</label>
                  <input
                    type="number"
                    min={1}
                    value={formValues.position as number}
                    onChange={(e) => setFormValues((p) => ({ ...p, position: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeModal}>Cancel</button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isSaving}>
                  {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>}
                  {modal.action === 'create' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseBuilder;
