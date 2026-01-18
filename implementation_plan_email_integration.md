# Implementation Plan: Resend Email Integration

## Objective
Enable a robust email system using **Resend** and **Supabase Edge Functions** that serves two distinct use cases:
1.  **Super Admin**: Administrative emails (e.g., system alerts, welcome emails).
2.  **Agents**: Sending emails to their clients (e.g., follow-ups, reminders) with proper tracking and "Reply-To" functionality.

## Architecture

To ensure security, deliverability, and quota management, all emails will be routed through a single Supabase Edge Function (`send-email`).

### key Components:
1.  **Supabase Edge Function (`send-email`)**:
    *   **Authentication**: Verifies the user is logged in.
    *   **Authorization & Quotas**: Checks the user's plan (Free/Pro) and monthly message limits before sending.
    *   **Sending Logic**: Uses Resend API.
        *   **From**: Always `AgentApp <system@mail.agentapp.my>` (or verified domain) to ensure high deliverability (SPF/DKIM).
        *   **Reply-To**: Set to the *Agent's email address* so client replies go directly to the agent.
    *   **Logging**: Automatically inserts a record into the `message_logs` table for audit trails and usage tracking.

2.  **Database (`message_logs`)**:
    *   Tracks every email sent.
    *   Used to calculate monthly usage (`count(*)` for the current month).

3.  **Frontend (`src/services/emailService.js`)**:
    *   Wrapper to call the Edge Function easily from React components.

---

## Step-by-Step Implementation

### Step 1: Update Supabase Edge Function
Modify `supabase/functions/send-email/index.ts` to include:
*   **User Lookup**: Fetch the user's role and plan from the `profiles` and `plans` tables.
*   **Quota Check**:
    *   If `role === 'super_admin'`, bypass limits.
    *   If `role === 'agent'`, perform a count on `message_logs` for the current month.
    *   Compare against the plan's `monthly_message_limit`.
    *   Reject request if over limit.
*   **Resend API Call**:
    *   Add `reply_to` parameter using `user.email`.
*   **Logging**:
    *   Insert `{ user_id, type: 'email', recipient, content_snippet: subject }` into `message_logs`.

### Step 2: Update Frontend Service
Update `src/services/emailService.js`:
*   Ensure `sendEmail` correctly handles the response from the updated Edge Function.
*   Add a new helper: `sendAgentEmail(to, subject, body)` which implicitly uses the logged-in agent's context.

### Step 3: UI Integration (Databases Page)
Update `src/pages/Databases.jsx`:
*   Add a **"Send Email"** button next to the WhatsApp button for each contact.
*   Implement a simple **"Compose Email" Modal**:
    *   Fields: Subject, Message (Textarea).
    *   "Send" button that calls `emailService.sendAgentEmail`.

### Step 4: Administrative Emails (Supabase Auth)
*   **Action**: Configure "SMTP Settings" in the Supabase Dashboard.
*   **Navigate**: Dashboard -> Authentication -> Email Templates -> SMTP Settings.
*   **Settings**:
    *   **Host**: `smtp.resend.com`
    *   **Port**: `465` (SSL)
    *   **User**: `resend`
    *   **Password**: Your `RESEND_API_KEY`.
    *   **Sender Email**: `system@mail.agentapp.my` (or your verified domain).
    *   **Sender Name**: `AgentApp`.
*   This ensures all standard Supabase emails (Password Reset, Magic Link, Confirm Email) use Resend automatically.

---

## Verification Plan
1.  **Test Usage Limit**:
    *   Set a low limit for a test user.
    *   Send emails until the limit is hit.
    *   Verify the next attempt fails with a "Limit Reached" error.
2.  **Test Reply-To**:
    *   Send an email from an Agent account to a real inbox.
    *   Click "Reply" in the inbox and verify the address is the Agent's email, not the System email.
3.  **Test Logging**:
    *   Check `message_logs` table to ensure the sent email was recorded.

## Dependencies & Requirements
*   `RESEND_API_KEY` must be set in Supabase Secrets.
*   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or `ANON_KEY` if using RLS correctly) must be accessible to the function.
*   A verified domain on Resend (e.g., `mail.agentapp.my`) is highly recommended for production to avoid spam folders.
