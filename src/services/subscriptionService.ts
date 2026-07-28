import api from './api'

export interface SubscriptionStatus {
  active: boolean
  expires_at: string | null
  package?: string
}

export interface InitiateResponse {
  redirect_url: string
  order_tracking_id: string
  merchant_reference: string
  amount: string
  currency: string
}

export interface Subscription {
  id: number
  package: string
  amount: string
  currency: string
  status: 'pending' | 'completed' | 'failed'
  payment_method: string | null
  merchant_reference: string
  order_tracking_id: string | null
  start_datetime: string | null
  end_datetime: string | null
  is_active: boolean
  created_at: string
}

export interface DiscountPreview {
  valid: boolean
  detail?: string
  code?: string
  original_amount?: string
  discounted_amount?: string
  currency?: string
}

export interface SubscriptionConfig {
  enforced: boolean
}

const subscriptionService = {
  async initiate(code?: string): Promise<InitiateResponse> {
    const response = await api.post('/api/v1/subscription/initiate/', code ? { code } : {})
    return response.data
  },

  async verify(orderTrackingId: string): Promise<Subscription> {
    const response = await api.get(`/api/v1/subscription/verify/${orderTrackingId}/`)
    return response.data
  },

  async status(): Promise<SubscriptionStatus> {
    const response = await api.get('/api/v1/subscription/status/')
    return response.data
  },

  async validateDiscountCode(code: string): Promise<DiscountPreview> {
    try {
      const response = await api.post('/api/v1/subscription/discount/validate/', { code })
      return response.data
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: DiscountPreview } }
      if (axiosErr.response?.data) return axiosErr.response.data
      return { valid: false, detail: 'Could not check that code. Please try again.' }
    }
  },

  async getConfig(): Promise<SubscriptionConfig> {
    const response = await api.get('/api/v1/subscription/config/')
    return response.data
  },

  async updateConfig(enforced: boolean): Promise<SubscriptionConfig> {
    const response = await api.patch('/api/v1/subscription/config/update/', { enforced })
    return response.data
  },
}

export default subscriptionService
