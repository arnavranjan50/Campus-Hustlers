import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment verification fields.',
      })
    }

    // Generate expected signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature === razorpay_signature) {
      return res.json({
        success: true,
        message: 'Payment verified successfully.',
        payment_id: razorpay_payment_id,
      })
    } else {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed. Signature mismatch.',
      })
    }
  } catch (error: any) {
    console.error('❌ Verification error:', error.message)
    return res.status(500).json({
      success: false,
      error: 'Payment verification failed.',
    })
  }
}
