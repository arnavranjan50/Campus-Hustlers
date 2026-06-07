import { useState, useCallback } from 'react'

interface PaymentRequest {
  /** Amount in paise (e.g., 50000 = ₹500) */
  amount: number
  currency?: string
  receipt?: string
  /** Prefill fields for the Razorpay modal */
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  /** Service title shown in Razorpay modal */
  description?: string
}

interface PaymentResult {
  payment_id: string
  order_id: string
}

interface UseRazorpayReturn {
  initiatePayment: (request: PaymentRequest) => Promise<PaymentResult>
  isProcessing: boolean
  error: string | null
  clearError: () => void
}

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string

export function useRazorpay(): UseRazorpayReturn {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const initiatePayment = useCallback(
    async (request: PaymentRequest): Promise<PaymentResult> => {
      setIsProcessing(true)
      setError(null)

      try {
        /* ── Step 1: Create Order ─────────────────────── */
        const orderRes = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: request.amount,
            currency: request.currency || 'INR',
            receipt: request.receipt,
          }),
        })

        const orderData = await orderRes.json()

        if (!orderRes.ok || !orderData.success) {
          throw new Error(orderData.error || 'Failed to create order')
        }

        /* ── Step 2: Open Razorpay Modal ──────────────── */
        const result = await new Promise<PaymentResult>((resolve, reject) => {
          if (!window.Razorpay) {
            reject(new Error('Razorpay SDK not loaded. Please refresh the page.'))
            return
          }

          const options: RazorpayOptions = {
            key: RAZORPAY_KEY_ID,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'Campus Hustlers',
            description: request.description || 'Service Payment',
            order_id: orderData.order_id,
            prefill: request.prefill,
            theme: {
              color: '#d4a853',
            },
            handler: async (response) => {
              try {
                /* ── Step 3: Verify Payment ───────────── */
                const verifyRes = await fetch('/api/verify-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                })

                const verifyData = await verifyRes.json()

                if (!verifyRes.ok || !verifyData.success) {
                  reject(new Error(verifyData.error || 'Payment verification failed'))
                  return
                }

                resolve({
                  payment_id: response.razorpay_payment_id,
                  order_id: response.razorpay_order_id,
                })
              } catch (verifyError: any) {
                reject(new Error(verifyError.message || 'Payment verification failed'))
              }
            },
            modal: {
              ondismiss: () => {
                reject(new Error('PAYMENT_CANCELLED'))
              },
              confirm_close: true,
            },
          }

          const rzp = new window.Razorpay(options)

          rzp.on('payment.failed', (response: any) => {
            const desc =
              response?.error?.description ||
              response?.error?.reason ||
              'Payment failed. Please try again.'
            reject(new Error(desc))
          })

          rzp.open()
        })

        setIsProcessing(false)
        return result
      } catch (err: any) {
        setIsProcessing(false)

        // Don't treat user-cancelled as a real error
        if (err.message === 'PAYMENT_CANCELLED') {
          throw err // let the caller decide how to handle it
        }

        setError(err.message || 'Payment failed')
        throw err
      }
    },
    [],
  )

  return { initiatePayment, isProcessing, error, clearError }
}
