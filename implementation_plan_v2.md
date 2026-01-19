# Implementation Plan: Email System & Automation (v2)

## Overview
We are continuing the integration of the Email System. The "Email Subject" feature for automation is largely implemented in the UI (`FollowUp.jsx`) and backend script structure (`check-auto-followups`), but robust **Quota Management** and **Manual Email Sending** are still missing or incomplete.

## Phase 1: Database & Schema Verification
1.  **Verify `workflow_steps` schema**: Ensure the `subject` column exists (was added in previous session).
2.  **Verify `message_logs` schema**: Ensure it supports tracking usage correctly.
3.  **RLS Policies**: Ensure Agents can only see their own logs/contacts.

## Phase 2: Quota Management (The "Limits")
We need to enforce the `monthly_message_limit` defined in the `plans` table.
1.  **Shared Logic**: Create a consistent way to check quota.
2.  **Update `supabase/functions/check-auto-followups/index.ts`**:
    *   **Before sending**: Count `message_logs` for the agent for the current month.
    *   **Check**: If `count >= monthly_message_limit` (and role is not 'super_admin'), **SKIP** sending and log a "Quota Exceeded" warning.
3.  **Update `supabase/functions/send-email/index.ts`**:
    *   **Before sending**: Perform the same count check.
    *   **Reject**: Return 403 error if limit reached.

## Phase 3: Manual Email Sending (UI)
Enable Agents to send ad-hoc emails to leads from the Database view.
1.  **`src/services/emailService.js`**:
    *   Ensure it points to `send-email` Edge Function.
    *   Handle success/error/quota-exceeded responses.
2.  **`src/components/EmailComposeModal.jsx`**:
    *   Create a reusable component for composing emails (Subject + Body).
    *   Include "Shortcodes" helper (like in FollowUp).
3.  **`src/pages/Databases.jsx`**:
    *   Add "Mail" icon button to contact rows.
    *   Open `EmailComposeModal` on click.
    *   Send via `emailService`.

## Phase 4: Testing & Verification
1.  **Auto-Automation Test**:
    *   Create a dummy contact due for follow-up.
    *   Manually invoke `check-auto-followups`.
    *   Verify email received with correct **Subject** and **Reply-To**.
2.  **Quota Test**:
    *   Temporarily lower a plan's limit.
    *   Attempt to send.
    *   Verify it is blocked.

## Next Step
Shall we proceed with **Phase 2 (Quota Management)** or **Phase 3 (Manual Email UI)** first?
