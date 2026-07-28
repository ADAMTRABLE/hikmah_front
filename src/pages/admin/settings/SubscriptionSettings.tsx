import { useEffect, useState } from 'react'
import adminStyles from '../shared/admin.module.css'
import styles from './SubscriptionSettings.module.css'
import subscriptionService from '../../../services/subscriptionService'

const SubscriptionSettings = () => {
  const [enforced, setEnforced] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    subscriptionService
      .getConfig()
      .then((config) => setEnforced(config.enforced))
      .catch(() => setError('Could not load the current setting.'))
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = async () => {
    if (enforced === null) return
    const next = !enforced
    setSaving(true)
    setError('')
    try {
      const config = await subscriptionService.updateConfig(next)
      setEnforced(config.enforced)
    } catch {
      setError('Could not update the setting. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const djangoAdminUrl = `${import.meta.env.VITE_API_BASE_URL}/admin/subscription/discountcode/`

  return (
    <div className={adminStyles.page}>
      <div className={adminStyles.pageHeader}>
        <div>
          <h1>Subscription Settings</h1>
          <p>Control whether courses and library resources require an active subscription.</p>
        </div>
      </div>

      <div className={adminStyles.card}>
        <div className={styles.toggleRow}>
          <div className={styles.toggleLabel}>
            <h3>Require subscription for content</h3>
            <p>
              When on, students without an active subscription see locked lessons and library
              resources and are prompted to subscribe. When off, everyone gets free access to everything.
            </p>
          </div>

          {loading ? (
            <span>Loading…</span>
          ) : (
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={!!enforced}
                disabled={saving}
                onChange={handleToggle}
              />
              <span className={styles.slider}></span>
            </label>
          )}
        </div>

        {!loading && enforced !== null && (
          <div style={{ padding: '0 24px 20px' }}>
            <span className={`${styles.statusPill} ${enforced ? styles.statusOn : styles.statusOff}`}>
              <i className={`fas ${enforced ? 'fa-lock' : 'fa-lock-open'}`}></i>
              {enforced ? 'Subscriptions enforced' : 'Subscriptions disabled — content is free for everyone'}
            </span>
          </div>
        )}

        {error && (
          <div style={{ padding: '0 24px 20px', color: 'var(--a-danger)', fontSize: '0.88rem' }}>{error}</div>
        )}
      </div>

      <div className={adminStyles.card} style={{ marginTop: '20px' }}>
        <div className={styles.hintCard}>
          <h3 style={{ marginBottom: '8px', color: 'var(--a-text)' }}>Discount codes</h3>
          <p>
            Create a discount code whenever someone reaches out asking for a discount — percentage off
            or a fixed UGX amount, with an optional usage limit and expiry date. This is managed from
            the Django admin panel (not here) at:
          </p>
          <p><a href={djangoAdminUrl} target="_blank" rel="noreferrer">{djangoAdminUrl}</a></p>
          <p>
            Leave the <code>code</code> field blank when creating one and Django will generate a
            random code like <code>HIKMAH-A1B2C3</code> for you.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionSettings
