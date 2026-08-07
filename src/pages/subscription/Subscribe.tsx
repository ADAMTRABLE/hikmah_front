import { useState } from 'react'
import { FaCrown, FaMobileScreenButton, FaCreditCard, FaBuildingColumns, FaTag } from 'react-icons/fa6'
import subscriptionService from '../../services/subscriptionService'
import './Subscribe.css'

// Keep in sync with SUBSCRIPTION_ANNUAL_FEE / SUBSCRIPTION_CURRENCY in the backend .env
const ANNUAL_FEE = 150000
const CURRENCY_LABEL = 'UGX'

const formatAmount = (n: number) => `${CURRENCY_LABEL} ${n.toLocaleString()}`

const Subscribe = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [code, setCode] = useState('')
  const [checkingCode, setCheckingCode] = useState(false)
  const [discountMessage, setDiscountMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [discountedAmount, setDiscountedAmount] = useState<number | null>(null)

  const handleApplyCode = async () => {
    const trimmed = code.trim()
    if (!trimmed) return
    setCheckingCode(true)
    setDiscountMessage(null)
    try {
      const result = await subscriptionService.validateDiscountCode(trimmed)
      if (result.valid && result.discounted_amount) {
        const discounted = Math.round(parseFloat(result.discounted_amount))
        setDiscountedAmount(discounted)
        setDiscountMessage({ type: 'success', text: `Code applied — you save ${formatAmount(ANNUAL_FEE - discounted)}!` })
      } else {
        setDiscountedAmount(null)
        setDiscountMessage({ type: 'error', text: result.detail || 'That code is not valid.' })
      }
    } catch {
      setDiscountedAmount(null)
      setDiscountMessage({ type: 'error', text: 'Could not check that code. Please try again.' })
    } finally {
      setCheckingCode(false)
    }
  }

  const handleSubscribe = async () => {
    setLoading(true)
    setError('')
    try {
      const { redirect_url } = await subscriptionService.initiate(
        discountedAmount !== null ? code.trim() : undefined
      )
      window.location.href = redirect_url
    } catch {
      setError('Could not start payment. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="subscribe-page">
      <div className="subscribe-card">
        <div className="subscribe-badge">
          <FaCrown />
        </div>

        <h1>Unlock Full Access</h1>
        <p className="subtitle">
          One payment covers every course and library resource on Hikmah for a full year.
        </p>

        <div className="price-block">
          <div className="price-amount">
            {discountedAmount !== null && (
              <span className="original">{formatAmount(ANNUAL_FEE)}</span>
            )}
            {formatAmount(discountedAmount ?? ANNUAL_FEE)}
          </div>
          <div className="price-period">per year · no auto-renewal</div>
        </div>

        <div className="discount-row">
          <input
            type="text"
            placeholder="Have a discount code?"
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              setDiscountMessage(null)
              setDiscountedAmount(null)
            }}
          />
          <button onClick={handleApplyCode} disabled={checkingCode || !code.trim()}>
            <FaTag style={{ marginRight: '0.35rem' }} />
            {checkingCode ? 'Checking…' : 'Apply'}
          </button>
        </div>

        {discountMessage && (
          <div className={`discount-message ${discountMessage.type}`}>{discountMessage.text}</div>
        )}

        {error && <div className="subscribe-error">{error}</div>}

        <button className="subscribe-btn" onClick={handleSubscribe} disabled={loading}>
          {loading ? 'Redirecting to payment…' : 'Subscribe Now'}
        </button>

        <div className="payment-methods">
          <FaMobileScreenButton title="MTN & Airtel Mobile Money" />
          <FaCreditCard title="Card" />
          <FaBuildingColumns title="Bank transfer" />
        </div>

        <p className="subscribe-hint">
          You'll be redirected to Pesapal to complete payment via MTN Mobile Money, Airtel Money, bank card, or bank transfer.
        </p>
      </div>
    </div>
  )
}

export default Subscribe
