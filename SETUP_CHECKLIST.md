# Setup Checklist

Use this checklist to track your progress setting up the6connect.

## Pre-Setup
- [ ] Have a Supabase account (or create one at https://supabase.com)
- [ ] Have project open in terminal/editor

## Supabase Project Setup
- [ ] Created new Supabase project named "the6connect"
- [ ] Saved database password securely
- [ ] Project finished initializing (green checkmark in dashboard)

## API Credentials
- [ ] Copied Project URL from Settings > API
- [ ] Copied anon public key from Settings > API
- [ ] Copied service_role key from Settings > API
- [ ] Created `.env.local` file in project root
- [ ] Added all three credentials to `.env.local`

## Database Migrations
- [ ] Opened SQL Editor in Supabase
- [ ] Ran migration 001_initial_schema.sql (Success - created all tables)
- [ ] Ran migration 002_rls_policies.sql (Success - applied security policies)
- [ ] Ran migration 003_seed_data.sql (Success - added life areas)
- [ ] Verified tables exist in Table Editor

## User Accounts - Auth
Created 4 auth users with Auto Confirm checked:
- [ ] User 1: _________________ (email) | UUID: _________________
- [ ] User 2: _________________ (email) | UUID: _________________
- [ ] User 3: _________________ (email) | UUID: _________________
- [ ] User 4: _________________ (email) | UUID: _________________

## User Accounts - Profiles
Inserted profile records for each user:
- [ ] User 1 profile inserted
- [ ] User 2 profile inserted
- [ ] User 3 profile inserted
- [ ] User 4 profile inserted
- [ ] Verified all 4 users visible in Table Editor > users

## Testing
- [ ] Ran `npm run dev` successfully
- [ ] Opened http://localhost:3000
- [ ] Redirected to login page
- [ ] Logged in as User 1 successfully
- [ ] Saw dashboard with welcome message
- [ ] Saw sidebar navigation with all menu items
- [ ] Clicked through menu items (all show "coming soon" pages)
- [ ] Clicked profile link (shows profile page)
- [ ] Logged out successfully
- [ ] Logged in as User 2 to verify different user works

## All Done! ✅
- [ ] Ready to proceed to Phase 2: Life Status & Commitments

---

## Notes & Issues

(Use this space to jot down any issues you encountered or notes for later)

-
-
-
