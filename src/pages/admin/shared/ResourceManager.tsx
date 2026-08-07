import { useEffect, useState } from 'react';
import type { ReactNode, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { getMediaUrl } from '../../../utils/media';
import styles from './admin.module.css';
import type { FieldConfig, ColumnConfig } from './types';

interface ResourceManagerProps<T extends { id: number | string }> {
  title: string;
  description?: string;
  listUrl: string;
  createUrl?: string;
  getDetailUrl: (id: number | string) => string;
  columns: ColumnConfig<T>[];
  fields: FieldConfig[];
  idField?: string;
  searchableKeys?: (keyof T)[];
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  emptyMessage?: string;
  createLabel?: string;
  modalTitle?: (editing: boolean) => string;
  transformBeforeSubmit?: (values: Record<string, unknown>) => Record<string, unknown>;
  rowActions?: (row: T, ctx: { refresh: () => void }) => ReactNode;
  // Lets a parent page inject fetched select options (e.g. categories, sheikhs) once ready
  isReady?: boolean;
  // When provided, adds a "View" button per row that navigates to a detail page instead of opening the edit modal
  getViewUrl?: (row: T) => string;
}

function defaultValueForField(field: FieldConfig): unknown {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.type === 'checkbox') return false;
  return '';
}

function ResourceManager<T extends { id: number | string }>({
  title,
  description,
  listUrl,
  createUrl,
  getDetailUrl,
  columns,
  fields,
  searchableKeys = [],
  canCreate = true,
  canEdit = true,
  canDelete = true,
  emptyMessage = 'Nothing here yet.',
  createLabel,
  modalTitle,
  transformBeforeSubmit,
  rowActions,
  isReady = true,
  getViewUrl,
}: ResourceManagerProps<T>) {
  const navigate = useNavigate();
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savingDeleteId, setSavingDeleteId] = useState<number | string | null>(null);

  const refresh = async () => {
    if (!isReady) return;
    try {
      setIsLoading(true);
      setError('');
      const res = await api.get<T[]>(listUrl);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError(`Failed to load ${title.toLowerCase()}.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, listUrl]);

  const openCreate = () => {
    const initial: Record<string, unknown> = {};
    fields.forEach((f) => { initial[f.name] = defaultValueForField(f); });
    setFormValues(initial);
    setEditingItem(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (row: T) => {
    const initial: Record<string, unknown> = {};
    fields.forEach((f) => {
      const raw = (row as unknown as Record<string, unknown>)[f.name];
      initial[f.name] = raw === null || raw === undefined ? defaultValueForField(f) : raw;
    });
    setFormValues(initial);
    setEditingItem(row);
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
  };

  const handleFieldChange = (name: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const flattenErrors = (data: unknown): string => {
    if (!data) return 'Something went wrong. Please try again.';
    if (typeof data === 'string') return data;
    if (Array.isArray(data)) return data.join(' ');
    if (typeof data === 'object') {
      return Object.entries(data as Record<string, unknown>)
        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : String(val)}`)
        .join(' | ');
    }
    return 'Something went wrong. Please try again.';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError('');

    let payload: Record<string, unknown> = { ...formValues };
    // Drop createOnly fields (e.g. password) when editing and left blank
    if (editingItem) {
      fields.forEach((f) => {
        if (f.createOnly && !payload[f.name]) delete payload[f.name];
        // File fields hold the existing URL string (not a File) until the admin picks a new file.
        // Sending that string back would fail validation, so only include it if it's an actual File.
        if (f.type === 'file' && !(payload[f.name] instanceof File)) delete payload[f.name];
      });
    }
    if (transformBeforeSubmit) payload = transformBeforeSubmit(payload);

    try {
      const hasFile = fields.some((f) => f.type === 'file') && Object.values(payload).some((v) => v instanceof File);
      const config = hasFile ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined;
      let body: unknown = payload;

      if (hasFile) {
        const form = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') form.append(k, v as string | Blob);
        });
        body = form;
      }

      if (editingItem) {
        await api.patch(getDetailUrl(editingItem.id), body, config);
      } else {
        await api.post(createUrl || listUrl, body, config);
      }
      setIsModalOpen(false);
      refresh();
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: unknown } };
      setFormError(flattenErrors(anyErr?.response?.data));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (row: T) => {
    if (!window.confirm('Are you sure you want to delete this item? This cannot be undone.')) return;
    try {
      setSavingDeleteId(row.id);
      await api.delete(getDetailUrl(row.id));
      refresh();
    } catch {
      alert('Failed to delete. Please try again.');
    } finally {
      setSavingDeleteId(null);
    }
  };

  const filteredItems = search.trim()
    ? items.filter((row) =>
        searchableKeys.some((key) => {
          const val = (row as unknown as Record<string, unknown>)[key as string];
          return val && String(val).toLowerCase().includes(search.trim().toLowerCase());
        })
      )
    : items;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        <div className={styles.headerActions}>
          {searchableKeys.length > 0 && (
            <div className={styles.searchBox}>
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          {canCreate && (
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={openCreate}>
              <i className="fas fa-plus"></i> {createLabel || 'Add New'}
            </button>
          )}
        </div>
      </div>

      <div className={styles.card}>
        {isLoading && (
          <div className={styles.stateBlock}>
            <i className="fas fa-spinner fa-spin"></i>
            Loading...
          </div>
        )}

        {!isLoading && error && (
          <div className={`${styles.stateBlock} ${styles.stateBlockError}`}>
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {!isLoading && !error && filteredItems.length === 0 && (
          <div className={styles.stateBlock}>
            <i className="fas fa-inbox"></i>
            {emptyMessage}
          </div>
        )}

        {!isLoading && !error && filteredItems.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  {(canEdit || canDelete || rowActions || getViewUrl) && <th></th>}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((row) => (
                  <tr key={row.id}>
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.render ? col.render(row) : String((row as unknown as Record<string, unknown>)[col.key] ?? '—')}
                      </td>
                    ))}
                    {(canEdit || canDelete || rowActions || getViewUrl) && (
                      <td>
                        <div className={styles.rowActions}>
                          {rowActions && rowActions(row, { refresh })}
                          {getViewUrl && (
                            <button
                              className={`${styles.btn} ${styles.btnIcon}`}
                              onClick={() => navigate(getViewUrl(row))}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          )}
                          {canEdit && (
                            <button
                              className={`${styles.btn} ${styles.btnIcon}`}
                              onClick={() => openEdit(row)}
                              title="Edit"
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                          )}
                          {canDelete && (
                            <button
                              className={`${styles.btn} ${styles.btnIcon}`}
                              onClick={() => handleDelete(row)}
                              disabled={savingDeleteId === row.id}
                              title="Delete"
                            >
                              {savingDeleteId === row.id
                                ? <i className="fas fa-spinner fa-spin"></i>
                                : <i className="fas fa-trash"></i>}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{modalTitle ? modalTitle(!!editingItem) : (editingItem ? `Edit ${title}` : `Add ${title}`)}</h3>
              <button className={styles.modalClose} onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                {formError && <div className={styles.formError}>{formError}</div>}
                <div className={styles.formGrid}>
                  {fields
                    .filter((f) => !(f.createOnly && editingItem && false)) // createOnly fields still shown, just optional on edit
                    .map((field) => (
                    <div
                      key={field.name}
                      className={`${styles.field} ${field.fullWidth ? styles.fieldFull : ''} ${field.type === 'checkbox' ? styles.checkboxField : ''}`}
                    >
                      {field.type === 'checkbox' ? (
                        <>
                          <input
                            type="checkbox"
                            id={field.name}
                            checked={!!formValues[field.name]}
                            onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                          />
                          <label htmlFor={field.name}>{field.label}</label>
                        </>
                      ) : (
                        <>
                          <label htmlFor={field.name}>
                            {field.label}{field.required && !field.createOnly ? ' *' : ''}
                            {field.createOnly && editingItem ? ' (leave blank to keep unchanged)' : ''}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea
                              id={field.name}
                              value={String(formValues[field.name] ?? '')}
                              required={field.required && !editingItem}
                              placeholder={field.placeholder}
                              onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            />
                          ) : field.type === 'select' ? (
                            <select
                              id={field.name}
                              value={String(formValues[field.name] ?? '')}
                              required={field.required}
                              onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            >
                              <option value="">Select...</option>
                              {field.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          ) : field.type === 'file' ? (
                            <>
                              {editingItem && typeof formValues[field.name] === 'string' && formValues[field.name] && (
                                <div style={{ marginBottom: 6 }}>
                                  <a href={getMediaUrl(String(formValues[field.name]))} target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem' }}>
                                    <i className="fas fa-paperclip"></i> Current file — click to view
                                  </a>
                                </div>
                              )}
                              <input
                                type="file"
                                id={field.name}
                                onChange={(e) => handleFieldChange(field.name, e.target.files?.[0] || null)}
                              />
                            </>
                          ) : (
                            <input
                              type={field.type}
                              id={field.name}
                              value={String(formValues[field.name] ?? '')}
                              required={field.required && !(field.createOnly && editingItem)}
                              placeholder={field.placeholder}
                              onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            />
                          )}
                          {field.helpText && <span className="helpText">{field.helpText}</span>}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isSaving}>
                  {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>}
                  {editingItem ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourceManager;
