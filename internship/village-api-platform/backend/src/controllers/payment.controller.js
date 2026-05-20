const crypto = require('crypto');
const Razorpay = require('razorpay');
const env = require('../config/env');
const apiKeyService = require('../services/apiKey.service');
const { success } = require('../utils/response');
const { ValidationError, NotFoundError } = require('../utils/errors');

const PLAN_PRICES = {
  PREMIUM:   { amount: 99900,  label: 'Premium Plan'   }, // ₹999
  PRO:       { amount: 249900, label: 'Pro Plan'        }, // ₹2,499
  UNLIMITED: { amount: 499900, label: 'Unlimited Plan'  }, // ₹4,999
};

const getRazorpay = () => {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new ValidationError('Payment gateway not configured');
  }
  return new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
};

const createOrder = async (req, res) => {
  const { planType } = req.body;

  if (!PLAN_PRICES[planType]) {
    throw new ValidationError('Invalid plan. Only PREMIUM, PRO, and UNLIMITED require payment.');
  }

  const razorpay = getRazorpay();
  const price = PLAN_PRICES[planType];

  const order = await razorpay.orders.create({
    amount: price.amount,
    currency: 'INR',
    receipt: `plan_${req.user.id}_${planType}_${Date.now()}`,
    notes: {
      userId: String(req.user.id),
      planType,
      userEmail: req.user.email,
    },
  });

  return success(res, {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: env.RAZORPAY_KEY_ID,
    planType,
    planLabel: price.label,
  });
};

const verifyAndUpgrade = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planType) {
    throw new ValidationError('Missing payment verification fields');
  }

  if (!PLAN_PRICES[planType]) {
    throw new ValidationError('Invalid plan type');
  }

  // Verify Razorpay signature
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    throw new ValidationError('Payment verification failed. Invalid signature.');
  }

  // Signature valid — upgrade plan
  const user = await apiKeyService.upgradePlan(req.user.id, planType);

  return success(res, {
    user,
    paymentId: razorpay_payment_id,
    planType,
  });
};

module.exports = { createOrder, verifyAndUpgrade };
