# Subscription Management Implementation Plan

## Overview
The "Manage Subscription" feature is designed to give users control over their billing lifecycle without requiring direct intervention from support staff. This document allows the "Manage Subscription" button to transition from a "Coming Soon" alert to a fully functional billing portal.

## 1. Objective
Enable users to:
-   View their renewal date and amount.
-   Update payment methods (Credit Card / FPX).
-   Download past invoices/receipts.
-   Cancel or Pause their subscription.

## 2. Technical Architecture

### A. The Billing Portal (Recommended Strategy)
Instead of building custom UI for credit card updates and invoice lists (which is complex and security-sensitive), we should use the **Customer Portal** feature provided by your Payment Gateway (e.g., Stripe, Chip, or Billplz).

*   **Chip**: Check if Chip provides a "Customer Portal" URL or API. If not, we must build a simple "Cancel/Update" UI manually.
*   **Stripe**: Has a native `billing_portal` API.

### B. "Manage Subscription" Button Logic
When the user clicks "Manage Subscription":
1.  **Frontend**: Calls a Supabase Edge Function `create-billing-portal-session`.
2.  **Backend (Edge Function)**: 
    *   Retrieves the user's `customer_id` from the `profiles` or `subscriptions` table.
    *   Calls the Payment Provider API to generate a temporary, secure Portal URL.
    *   Returns the URL to the frontend.
3.  **Frontend**: Redirects the user to that URL.

## 3. Implementation Steps

### Phase 1: Database Updates
We need to track subscription mappings.
-   **Table**: `subscriptions` (or add columns to `profiles`)
    -   `user_id`: UUID
    -   `provider_customer_id`: String (e.g., `cus_12345`)
    -   `provider_subscription_id`: String (e.g., `sub_abcde`)
    -   `status`: 'active', 'past_due', 'canceled'
    -   `current_period_end`: Timestamp

### Phase 2: Edge Function (`manage-subscription`)
Create a new function that handles the logic:
```typescript
// Pseudo-code for Edge Function
serve(async (req) => {
  const { user } = await getUser(req);
  const profile = await getProfile(user.id);
  
  if (!profile.stripe_customer_id) {
     return Response.error("No billing account found.");
  }

  // Generate Portal Link
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: 'https://agentapp.my/settings?tab=billing',
  });

  return Response.json({ url: session.url });
});
```

### Phase 3: Frontend Integration
Update the currently placeholder button in `Settings.jsx`:

```javascript
const handleManageSubscription = async () => {
    setLoading(true);
    try {
        const { data } = await supabase.functions.invoke('manage-subscription');
        if (data?.url) window.location.href = data.url;
        else alert('Could not access billing portal.');
    } catch (e) {
        alert('Error accessing billing settings.');
    } finally {
        setLoading(false);
    }
};
```

## 4. Immediate Fallback (If no automated portal exists yet)
If you are using a manual payment method or a gateway without a portal (like basic FPX):
-   **Action**: The button should open a **"Subscription Help" Modal**.
-   **Content**:
    -   "To update your plan or cancel, please contact billing support."
    -   **Button**: "Chat with Support" (Links to WhatsApp `wa.me/601xxxxx?text=Help with billing`).
    -   **Button**: "Request Invoice" (Triggers an email with the latest invoice).

## 5. Summary
The "Manage Subscription" button is the gateway to self-serve billing. For now, until the backend integration is active, we recommend linking it to a **WhatsApp Billing Support** channel to ensure users don't feel stuck.
