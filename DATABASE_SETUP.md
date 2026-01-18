# AgentApp Database Setup Guide

## Quick Setup (Recommended)

### Option 1: Using Supabase Dashboard (Easiest)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `nywvatykietyhbhugcbl`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Setup Script**
   - Open the file: `supabase/migrations/00_complete_setup.sql`
   - Copy ALL the content
   - Paste it into the SQL Editor
   - Click "Run" button

4. **Verify Setup**
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - ✅ profiles
     - ✅ plans
     - ✅ contacts
     - ✅ promo_codes
     - ✅ message_logs

5. **Refresh Your App**
   - The app should now work without fallback data!

---

## Option 2: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd "d:\AntiGravity\Agent App"

# Link to your project (one time only)
supabase link --project-ref nywvatykietyhbhugcbl

# Run all migrations
supabase db push

# Or run the complete setup directly
supabase db execute -f supabase/migrations/00_complete_setup.sql
```

---

## What This Setup Does

1. **Creates 5 Core Tables:**
   - `profiles` - User accounts and settings
   - `plans` - Subscription tiers (Free, Pro)
   - `contacts` - User's client database
   - `promo_codes` - Promotional codes for trials/discounts
   - `message_logs` - Track WhatsApp/Email/SMS usage

2. **Sets Up Security:**
   - Row Level Security (RLS) on all tables
   - Users can only see their own data
   - Super admins can manage everything

3. **Adds Default Data:**
   - Free plan (50 contacts, 300 messages/month)
   - Pro plan (1000 contacts, 3000 messages/month)
   - Default promo codes: KDIGITAL, WELCOME50

4. **Creates Triggers:**
   - Auto-create profile when user signs up
   - Auto-update timestamps

---

## Troubleshooting

### If you see "table already exists" errors:
- This is normal! The script uses `IF NOT EXISTS` to safely update existing tables
- Just ignore these warnings

### If you see RLS policy errors:
- The script drops and recreates policies, so this is expected
- The final state will be correct

### If the app still shows fallback data:
1. Hard refresh the browser (Ctrl+Shift+R)
2. Check browser console for errors
3. Verify tables exist in Supabase Dashboard

---

## Next Steps After Setup

1. **Test the app** - All features should now use Supabase
2. **Create a super admin account** - Update your profile's role to 'super_admin' in Supabase
3. **Remove localStorage** - The app will now use database only

---

## Need Help?

If you encounter any issues, check:
1. Supabase Dashboard > Logs
2. Browser Console (F12)
3. Network tab for API errors
