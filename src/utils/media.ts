// Resolves image/file paths returned by the API into URLs the browser can load.
//
// The Django backend sometimes returns an absolute URL for media fields
// (e.g. "http://localhost:8000/media/covers/x.jpg") and sometimes a
// relative path (e.g. "/media/covers/x.jpg") depending on whether the
// serializer had request context. A relative path resolves against the
// *frontend's* origin in the browser, not the API's, so it 404s. This
// helper normalizes both cases to a full, loadable URL.

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export const getMediaUrl = (path?: string | null): string | undefined => {
    if (!path) return undefined;
    if (/^https?:\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
        return path;
    }
    return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
};
