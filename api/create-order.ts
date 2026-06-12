import type { VercelRequest, VercelResponse } from '@vercel/node'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { amount, currency = 'INR', receipt } = req.body

    // Validate amount (minimum 100 paise = ₹1)
    if (!amount || typeof amount !== 'number' || amount < 100) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be at least 100 paise (₹1)',
      })
    }

    const options = {
      amount,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)

    return res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error: any) {
    console.error('❌ Order creation failed:', error.message)

    if (error.statusCode === 401) {
      return res.status(401).json({
        success: false,
        error: 'Razorpay authentication failed. Check your API keys.',
      })
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to create order. Please try again.',
    })
  }
}
