// src/lib/stripe.ts
// Helper for calling the cancel subscription API from the frontend

export async function cancelSubscription(userId: string, subscriptionId: string): Promise<{ success: boolean; error?: string }> {
  // Mocked for frontend-only testing
  await new Promise(res => setTimeout(res, 1000));
  return { success: true };
}
