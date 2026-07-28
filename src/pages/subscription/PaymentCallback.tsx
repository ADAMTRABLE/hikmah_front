import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { FaSpinner, FaCircleCheck, FaClock, FaCircleXmark } from 'react-icons/fa6'
import subscriptionService from '../../services/subscriptionService'
import './PaymentCallback.css'

type Outcome = 'checking' | 'success' | 'failed' | 'pending'

const PaymentCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [outcome, setOutcome] = useState<Outcome>('checking')

  useEffect(() => {
    const orderTrackingId = searchParams.get('OrderTrackingId')
    if (!orderTrackingId) {
      setOutcome('failed')
      return
    }

    const check = async () => {
      try {
        const subscription = await subscriptionService.verify(orderTrackingId)
        if (subscription.status === 'completed') {
          setOutcome('success')
        } else if (subscription.status === 'failed') {
          setOutcome('failed')
        } else {
          setOutcome('pending')
        }
      } catch {
        setOutcome('failed')
      }
    }
    check()
  }, [searchParams])

  return (
    <div className="callback-page">
      <div className="callback-card">
        {outcome === 'checking' && (
          <>
            <div className="callback-icon checking"><FaSpinner /></div>
            <h2>Confirming your payment</h2>
            <p>This usually takes a few seconds…</p>
          </>
        )}

        {outcome === 'success' && (
          <>
            <div className="callback-icon success"><FaCircleCheck /></div>
            <h2>You're all set!</h2>
            <p>Payment successful — your subscription is active for the next year.</p>
            <button className="callback-btn" onClick={() => navigate('/')}>Go to courses</button>
          </>
        )}

        {outcome === 'pending' && (
          <>
            <div className="callback-icon pending"><FaClock /></div>
            <h2>Still processing</h2>
            <p>
              This is common with mobile money — check your phone to approve the prompt if you haven't already,
              then refresh.
            </p>
            <button className="callback-btn" onClick={() => window.location.reload()}>Refresh</button>
          </>
        )}

        {outcome === 'failed' && (
          <>
            <div className="callback-icon failed"><FaCircleXmark /></div>
            <h2>Payment not confirmed</h2>
            <p>We couldn't confirm your payment. If money left your account, please contact support.</p>
            <button className="callback-btn secondary" onClick={() => navigate('/subscribe')}>Try again</button>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentCallback
