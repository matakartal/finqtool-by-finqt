// /api/cancel-subscription.js
// Backend endpoint to cancel a Stripe subscription for a user.
// This is a template. You must add your Stripe secret key as an env variable.

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Cancel a user's active Stripe subscription.
 * Expects: POST { userId: string | null, subscriptionId: string }
 * Returns: { success: boolean, error?: string }
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, subscriptionId } = req.body;
  if (!userId || !subscriptionId) {
    return res.status(400).json({ error: 'Missing userId or subscriptionId' });
  }

  try {
    // Cancel the subscription at period end
    const deleted = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    // Optionally, update your DB to reflect the pending cancellation
    // await db.profiles.update({ id: userId }, { pro: false });
    return res.status(200).json({ success: true, subscription: deleted });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
