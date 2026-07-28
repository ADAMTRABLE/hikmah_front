import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../services/api';
import AdminTabs from '../shared/AdminTabs';
import styles from '../shared/admin.module.css';
import detailStyles from '../shared/DetailPage.module.css';

interface Choice {
  id?: number;
  text: string;
  is_correct: boolean;
  position: number;
}

interface QuestionRow {
  id: number;
  assessment: number;
  text: string;
  question_type: 'single' | 'multi' | 'boolean';
  grading_mode: 'all_or_nothing' | 'partial_credit';
  points: number;
  position: number;
  choices: Choice[];
}

interface AssessmentInfo {
  id: number;
  name: string;
  course: number;
  question_count: number;
}

interface AttemptRow {
  id: number;
  user: number;
  user_name: string;
  assessment_name: string;
  attempt_number: number;
  status: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  submitted_at: string | null;
}

const emptyChoice = (position: number): Choice => ({ text: '', is_correct: false, position });

const QuestionsAdmin = () => {
  const { id } = useParams(); // assessment id
  const [tab, setTab] = useState('questions');
  const [assessment, setAssessment] = useState<AssessmentInfo | null>(null);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<QuestionRow | null>(null);
  const [formText, setFormText] = useState('');
  const [formType, setFormType] = useState<'single' | 'multi' | 'boolean'>('single');
  const [formGradingMode, setFormGradingMode] = useState<'all_or_nothing' | 'partial_credit'>('all_or_nothing');
  const [formPoints, setFormPoints] = useState('1');
  const [formChoices, setFormChoices] = useState<Choice[]>([emptyChoice(1), emptyChoice(2)]);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; warnings: string[] } | null>(null);

  const load = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [assessmentRes, questionsRes] = await Promise.all([
        api.get<AssessmentInfo>(`/api/v1/courses/assessments/${id}/`),
        api.get<QuestionRow[]>(`/api/v1/courses/questions/?assessment=${id}`),
      ]);
      setAssessment(assessmentRes.data);
      setQuestions(questionsRes.data);
    } catch {
      setError('Failed to load this assessment.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAttempts = async () => {
    try {
      const res = await api.get<AttemptRow[]>(`/api/v1/courses/assessments/${id}/attempts/`);
      setAttempts(Array.isArray(res.data) ? res.data : []);
    } catch {
      setAttempts([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (tab === 'attempts') loadAttempts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const openCreate = () => {
    setEditing(null);
    setFormText('');
    setFormType('single');
    setFormGradingMode('all_or_nothing');
    setFormPoints('1');
    setFormChoices([emptyChoice(1), emptyChoice(2)]);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (q: QuestionRow) => {
    setEditing(q);
    setFormText(q.text);
    setFormType(q.question_type);
    setFormGradingMode(q.grading_mode);
    setFormPoints(String(q.points));
    setFormChoices(q.choices.length ? q.choices : [emptyChoice(1), emptyChoice(2)]);
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalOpen(false);
  };

  const addChoiceRow = () => {
    setFormChoices((prev) => [...prev, emptyChoice(prev.length + 1)]);
  };

  const removeChoiceRow = (index: number) => {
    setFormChoices((prev) => prev.filter((_, i) => i !== index));
  };

  const updateChoiceText = (index: number, text: string) => {
    setFormChoices((prev) => prev.map((c, i) => (i === index ? { ...c, text } : c)));
  };

  const toggleChoiceCorrect = (index: number) => {
    setFormChoices((prev) => {
      if (formType === 'single') {
        // Only one choice can be correct — selecting one clears the others
        return prev.map((c, i) => ({ ...c, is_correct: i === index }));
      }
      return prev.map((c, i) => (i === index ? { ...c, is_correct: !c.is_correct } : c));
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError('');

    const payload = {
      assessment: Number(id),
      text: formText,
      question_type: formType,
      grading_mode: formGradingMode,
      points: Number(formPoints) || 1,
      position: editing ? editing.position : questions.length + 1,
      choices: formType === 'boolean'
        ? []
        : formChoices.filter((c) => c.text.trim() !== '').map((c, i) => ({ text: c.text, is_correct: c.is_correct, position: i + 1 })),
    };

    try {
      if (editing) {
        await api.patch(`/api/v1/courses/questions/${editing.id}/`, payload);
      } else {
        await api.post('/api/v1/courses/questions/', payload);
      }
      setModalOpen(false);
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

  const handleDelete = async (q: QuestionRow) => {
    if (!window.confirm('Delete this question? This cannot be undone.')) return;
    await api.delete(`/api/v1/courses/questions/${q.id}/`);
    load();
  };

  const handleImport = async () => {
    if (!importFile) return;
    setIsImporting(true);
    setImportResult(null);
    const form = new FormData();
    form.append('file', importFile);
    try {
      const res = await api.post(`/api/v1/courses/assessments/${id}/questions/bulk-import/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResult(res.data);
      setImportFile(null);
      load();
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { error?: string } } };
      setImportResult({ created: 0, warnings: [anyErr?.response?.data?.error || 'Import failed.'] });
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoading) {
    return <div className={styles.page}><div className={styles.stateBlock}><i className="fas fa-spinner fa-spin"></i> Loading...</div></div>;
  }

  if (error || !assessment) {
    return (
      <div className={styles.page}>
        <div className={`${styles.stateBlock} ${styles.stateBlockError}`}><i className="fas fa-exclamation-circle"></i> {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link to={`/admin/courses/${assessment.course}/assessments`} className={detailStyles.backLink}>
        <i className="fas fa-arrow-left"></i> Back to Assessments
      </Link>

      <div className={styles.pageHeader}>
        <div>
          <h1>{assessment.name}</h1>
          <p>{questions.length} question{questions.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className={styles.headerActions}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={openCreate}>
            <i className="fas fa-plus"></i> Add Question
          </button>
        </div>
      </div>

      <AdminTabs
        tabs={[
          { key: 'questions', label: 'Questions', icon: 'fa-list-check' },
          { key: 'import', label: 'Bulk Import', icon: 'fa-file-csv' },
          { key: 'attempts', label: 'Attempts', icon: 'fa-users' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'questions' && (
        <div className={styles.card}>
          {questions.length === 0 && (
            <div className={styles.stateBlock}>
              <i className="fas fa-list-check"></i>
              No questions yet. Add one, or use Bulk Import for a CSV.
            </div>
          )}
          {questions.map((q, idx) => (
            <div key={q.id} style={{ padding: '18px 20px', borderBottom: idx < questions.length - 1 ? '1px solid var(--a-border)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                      {q.question_type === 'single' ? 'Single Select' : q.question_type === 'multi' ? 'Multi Select' : 'True/False'}
                    </span>
                    {q.question_type === 'multi' && (
                      <span className={`${styles.badge} ${styles.badgeApproved}`}>
                        {q.grading_mode === 'partial_credit' ? 'Partial Credit' : 'All or Nothing'}
                      </span>
                    )}
                    <span className={styles.cellMuted}>{q.points} pt{q.points !== 1 ? 's' : ''}</span>
                  </div>
                  <p style={{ margin: '0 0 8px', fontWeight: 600 }}>{q.text}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {q.choices.map((c) => (
                      <span key={c.text} style={{ fontSize: '0.85rem', color: c.is_correct ? 'var(--a-success)' : 'var(--a-text-light)' }}>
                        <i className={`fas ${c.is_correct ? 'fa-check' : 'fa-circle'}`} style={{ fontSize: '0.6rem', marginRight: '8px' }}></i>
                        {c.text}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles.rowActions}>
                  <button className={`${styles.btn} ${styles.btnIcon}`} onClick={() => openEdit(q)} title="Edit">
                    <i className="fas fa-pen"></i>
                  </button>
                  <button className={`${styles.btn} ${styles.btnIcon}`} onClick={() => handleDelete(q)} title="Delete">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'import' && (
        <div className={styles.card} style={{ padding: '24px' }}>
          <h3 style={{ marginTop: 0 }}>Bulk Import from CSV</h3>
          <p className={styles.cellMuted} style={{ marginBottom: '16px' }}>
            One row per choice, grouped by a repeated <code>question_key</code>. Columns: <code>question_key, question_text, question_type, grading_mode, points, choice_text, is_correct</code>.
            Boolean questions don't need choice rows — True/False are added automatically.
          </p>
          <div className={styles.field}>
            <input type="file" accept=".csv" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
          </div>
          <button className={`${styles.btn} ${styles.btnPrimary}`} disabled={!importFile || isImporting} onClick={handleImport}>
            {isImporting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-upload"></i>}
            Import
          </button>

          {importResult && (
            <div style={{ marginTop: '20px' }}>
              <p><strong>{importResult.created}</strong> question{importResult.created !== 1 ? 's' : ''} created.</p>
              {importResult.warnings.length > 0 && (
                <div className={styles.formError}>
                  {importResult.warnings.map((w, i) => <div key={i}>{w}</div>)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'attempts' && (
        <div className={styles.card}>
          {attempts.length === 0 && (
            <div className={styles.stateBlock}>
              <i className="fas fa-users"></i>
              No attempts recorded yet.
            </div>
          )}
          {attempts.length > 0 && (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Attempt #</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Result</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a) => (
                    <tr key={a.id}>
                      <td>{a.user_name}</td>
                      <td>{a.attempt_number}</td>
                      <td>{a.status}</td>
                      <td>{a.score}/{a.max_score} ({a.percentage}%)</td>
                      <td>
                        <span className={`${styles.badge} ${a.passed ? styles.badgeApproved : styles.badgeRejected}`}>
                          {a.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td>{a.submitted_at ? new Date(a.submitted_at).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className={styles.modalHeader}>
              <h3>{editing ? 'Edit Question' : 'Add Question'}</h3>
              <button className={styles.modalClose} onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                {formError && <div className={styles.formError}>{formError}</div>}

                <div className={styles.field}>
                  <label>Question Text *</label>
                  <textarea required value={formText} onChange={(e) => setFormText(e.target.value)} />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>Type *</label>
                    <select value={formType} onChange={(e) => setFormType(e.target.value as typeof formType)}>
                      <option value="single">Single Select</option>
                      <option value="multi">Multi Select</option>
                      <option value="boolean">True / False</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Points</label>
                    <input type="number" step="0.5" min="0" value={formPoints} onChange={(e) => setFormPoints(e.target.value)} />
                  </div>
                </div>

                {formType === 'multi' && (
                  <div className={styles.field}>
                    <label>Grading Mode</label>
                    <select value={formGradingMode} onChange={(e) => setFormGradingMode(e.target.value as typeof formGradingMode)}>
                      <option value="all_or_nothing">All or Nothing (default)</option>
                      <option value="partial_credit">Partial Credit</option>
                    </select>
                    <span className="helpText">
                      {formGradingMode === 'partial_credit'
                        ? 'Students earn proportional credit: +1 per correct pick, -1 per incorrect pick, floored at 0.'
                        : 'Full points only if the student selects exactly the correct set of choices.'}
                    </span>
                  </div>
                )}

                {formType === 'boolean' ? (
                  <p className={styles.cellMuted}>True/False choices are added automatically — nothing to configure here.</p>
                ) : (
                  <div className={styles.field}>
                    <label>Choices — {formType === 'single' ? 'select one correct answer' : 'check all correct answers'}</label>
                    {formChoices.map((choice, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <input
                          type={formType === 'single' ? 'radio' : 'checkbox'}
                          name="correctChoice"
                          checked={choice.is_correct}
                          onChange={() => toggleChoiceCorrect(index)}
                          title="Mark as correct"
                        />
                        <input
                          type="text"
                          value={choice.text}
                          placeholder={`Choice ${index + 1}`}
                          onChange={(e) => updateChoiceText(index, e.target.value)}
                          style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--a-border)', borderRadius: '6px' }}
                        />
                        {formChoices.length > 2 && (
                          <button type="button" className={`${styles.btn} ${styles.btnIcon}`} onClick={() => removeChoiceRow(index)}>
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`} onClick={addChoiceRow}>
                      <i className="fas fa-plus"></i> Add Choice
                    </button>
                  </div>
                )}
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeModal}>Cancel</button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isSaving}>
                  {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>}
                  {editing ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsAdmin;
