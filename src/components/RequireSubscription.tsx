import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSubscription } from '../hooks/useSubscription'

/**
 * Wrap any route/page that should be locked once the annual subscription
 * expires, e.g.:
 *
 *   { path: 'courses/:id', element: <RequireSubscription><QuranArabicCourse /></RequireSubscription> }
 */
const RequireSubscription = ({ children }: { children: ReactNode }) => {
  const { status, loading } = useSubscription()

  if (loading) return <p>Checking subscription…</p>
  if (!status?.active) return <Navigate to="/subscribe" replace />

  return <>{children}</>
}

export default RequireSubscription
