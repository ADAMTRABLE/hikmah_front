import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../services/api';
import styles from '../shared/admin.module.css';
import detailStyles from '../shared/DetailPage.module.css';

interface SubmissionDetail {
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
  published_resource: number | null;
  created_at: string;
}

const LibrarySubmissionDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState<SubmissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [publishUrl, setPublishUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedResource, setPublishedResource] = useState<{ id: number; title: string } | null>(null);

  const load = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.get<SubmissionDetail>(`/api/v1/library/submissions/${id}/`);
      setItem(res.data);
      setStatusReason(res.data.status_reason || '');
    } catch {
      setError('Failed to load this submission. It may have been deleted.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async (status: 'Approved' | 'Rejected') => {
    setActionError('');
    setIsSaving(true);
    try {
      const res = await api.patch<SubmissionDetail>(`/api/v1/library/submissions/${id}/`, {
        status,
        status_reason: statusReason,
      });
      setItem(res.data);
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: unknown; status?: number } };
      if (anyErr?.response?.status === 401 || anyErr?.response?.status === 403) {
        setActionError('You are not authorized to review submissions. Please make sure you are logged in as an admin.');
      } else {
        setActionError('Something went wrong updating this submission. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const saveNotesOnly = async () => {
    setActionError('');
    setIsSaving(true);
    try {
      const res = await api.patch<SubmissionDetail>(`/api/v1/library/submissions/${id}/`, {
        status_reason: statusReason,
      });
      setItem(res.data);
    } catch {
      setActionError('Failed to save notes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setActionError('');
    setIsPublishing(true);
    try {
      const res = await api.post<{ id: number; title: string }>(
        `/api/v1/library/submissions/${id}/publish/`,
        publishUrl ? { url: publishUrl } : {}
      );
      setPublishedResource(res.data);
      load();
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { error?: string } } };
      setActionError(anyErr?.response?.data?.error || 'Failed to publish this resource. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.stateBlock}><i className="fas fa-spinner fa-spin"></i> Loading...</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className={styles.page}>
        <div className={`${styles.stateBlock} ${styles.stateBlockError}`}>
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
        <Link to="/admin/library" className={`${styles.btn} ${styles.btnSecondary}`}>Back to Library</Link>
      </div>
    );
  }

  const badgeClass =
    item.status === 'Approved' ? styles.badgeApproved
    : item.status === 'Rejected' ? styles.badgeRejected
    : styles.badgePending;

  return (
    <div className={styles.page}>
      <Link to="/admin/library" className={detailStyles.backLink}>
        <i className="fas fa-arrow-left"></i> Back to Library
      </Link>

      <div className={styles.pageHeader}>
        <div>
          <h1>{item.resource_title}</h1>
          <p>Submitted by {item.resource_author} on {new Date(item.created_at).toLocaleDateString()}</p>
        </div>
        <span className={`${styles.badge} ${badgeClass}`} style={{ fontSize: '0.9rem', padding: '8px 18px' }}>
          {item.status}
        </span>
      </div>

      {actionError && <div className={styles.formError}>{actionError}</div>}

      <div className={detailStyles.grid}>
        <div className={`${styles.card} ${detailStyles.mainCard}`}>
          <div className={detailStyles.section}>
            <h3>Resource Details</h3>
            <dl className={detailStyles.infoList}>
              <dt>Title</dt><dd>{item.resource_title}</dd>
              <dt>Author</dt><dd>{item.resource_author}</dd>
              <dt>Category</dt><dd>{item.resource_category}</dd>
              <dt>Type</dt><dd>{item.resource_type}</dd>
              <dt>Description</dt><dd>{item.resource_description}</dd>
              {item.file && (
                <>
                  <dt>Attached File</dt>
                  <dd><a href={item.file} target="_blank" rel="noreferrer">View uploaded file <i className="fas fa-external-link-alt"></i></a></dd>
                </>
              )}
            </dl>
          </div>

          <div className={detailStyles.section}>
            <h3>Contact</h3>
            <dl className={detailStyles.infoList}>
              <dt>Email</dt><dd>{item.contact_email}</dd>
              <dt>Phone</dt><dd>{item.contact_phone || '—'}</dd>
              {item.additional_notes && (<>
                <dt>Notes from submitter</dt><dd>{item.additional_notes}</dd>
              </>)}
            </dl>
          </div>
        </div>

        <div className={`${styles.card} ${detailStyles.sideCard}`}>
          <h3>Review</h3>

          {item.status === 'Pending' && (
            <>
              <div className={styles.field}>
                <label htmlFor="statusReason">Review notes</label>
                <textarea
                  id="statusReason"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Optional — reasoning shared internally about this decision"
                />
              </div>
              <div className={detailStyles.actionStack}>
                <button
                  className={`${styles.btn} ${styles.btnSuccess}`}
                  disabled={isSaving}
                  onClick={() => updateStatus('Approved')}
                >
                  <i className="fas fa-check"></i> Approve
                </button>
                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  disabled={isSaving}
                  onClick={() => updateStatus('Rejected')}
                >
                  <i className="fas fa-times"></i> Reject
                </button>
                <button
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  disabled={isSaving}
                  onClick={saveNotesOnly}
                >
                  <i className="fas fa-save"></i> Save Notes Only
                </button>
              </div>
            </>
          )}

          {item.status === 'Rejected' && (
            <>
              <p className={styles.cellMuted}>This submission was rejected{item.status_reason ? `: "${item.status_reason}"` : '.'}</p>
              <div className={detailStyles.actionStack}>
                <button className={`${styles.btn} ${styles.btnSecondary}`} disabled={isSaving} onClick={() => updateStatus('Approved')}>
                  <i className="fas fa-rotate-left"></i> Reconsider &amp; Approve
                </button>
              </div>
            </>
          )}

          {item.status === 'Approved' && !item.published_resource && !publishedResource && (
            <>
              <p className={styles.cellMuted}>
                Approved. Publish it to make it live on the public Library page.
              </p>
              <div className={styles.field}>
                <label htmlFor="publishUrl">Resource URL{item.file ? ' (leave blank to use the uploaded file)' : ''}</label>
                <input
                  id="publishUrl"
                  type="url"
                  value={publishUrl}
                  onChange={(e) => setPublishUrl(e.target.value)}
                  placeholder={item.file ? 'Uses uploaded file if left blank' : 'https://...'}
                />
              </div>
              <div className={detailStyles.actionStack}>
                <button className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPublishing} onClick={handlePublish}>
                  {isPublishing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-globe"></i>}
                  Publish to Library
                </button>
                <button className={`${styles.btn} ${styles.btnSecondary}`} disabled={isSaving} onClick={() => updateStatus('Rejected')}>
                  <i className="fas fa-times"></i> Reject Instead
                </button>
              </div>
            </>
          )}

          {(item.published_resource || publishedResource) && (
            <div className={detailStyles.actionStack}>
              <p className={styles.cellMuted}><i className="fas fa-check-circle" style={{ color: 'var(--a-success)' }}></i> Published to the Library.</p>
              <Link to="/admin/library" className={`${styles.btn} ${styles.btnSecondary}`}>
                <i className="fas fa-book"></i> View in Library
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibrarySubmissionDetail;
