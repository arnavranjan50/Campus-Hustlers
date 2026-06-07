import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import crypto from 'crypto'
import Razorpay from 'razorpay'

dotenv.config()

const app = express()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(express.json())

/* ── Razorpay Instance ───────────────────────────────── */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

/* ── POST /api/create-order ──────────────────────────── */

app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body

    // Validate amount (minimum 100 paise = ₹1)
    if (!amount || typeof amount !== 'number' || amount < 100) {
      res.status(400).json({
        success: false,
        error: 'Amount must be at least 100 paise (₹1)',
      })
      return
    }

    const options = {
      amount,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)

    console.log(`✅ Order created: ${order.id} | ₹${amount / 100}`)

    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error: any) {
    console.error('❌ Order creation failed:', error.message)

    if (error.statusCode === 401) {
      res.status(401).json({
        success: false,
        error: 'Razorpay authentication failed. Check your API keys.',
      })
      return
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create order. Please try again.',
    })
  }
})

/* ── POST /api/verify-payment ────────────────────────── */

app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({
        success: false,
        error: 'Missing required payment verification fields.',
      })
      return
    }

    // Generate expected signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature === razorpay_signature) {
      console.log(`✅ Payment verified: ${razorpay_payment_id}`)
      res.json({
        success: true,
        message: 'Payment verified successfully.',
        payment_id: razorpay_payment_id,
      })
    } else {
      console.warn(`⚠️ Signature mismatch for payment: ${razorpay_payment_id}`)
      res.status(400).json({
        success: false,
        error: 'Payment verification failed. Signature mismatch.',
      })
    }
  } catch (error: any) {
    console.error('❌ Verification error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Payment verification failed.',
    })
  }
})

/* ── Start Server ────────────────────────────────────── */

app.listen(PORT, () => {
  console.log(`🚀 Razorpay server running on http://localhost:${PORT}`)
  console.log(`   Key ID: ${process.env.RAZORPAY_KEY_ID?.slice(0, 12)}...`)
})
