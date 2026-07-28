import { useEffect, useState } from 'react'
import subscriptionService from '../services/subscriptionService'
import type { SubscriptionStatus } from '../services/subscriptionService'

export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    subscriptionService
      .status()
      .then(setStatus)
      .catch(() => setStatus({ active: false, expires_at: null }))
      .finally(() => setLoading(false))
  }, [])

  return { status, loading }
}
