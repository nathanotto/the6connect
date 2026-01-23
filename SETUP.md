# the6connect Setup Guide

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click **"New Project"**
4. Fill in the details:
   - **Name**: `the6connect`
   - **Database Password**: Create a strong password and **save it somewhere safe**
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Free tier
5. Click **"Create new project"**
6. Wait ~2 minutes for project creation

---

## Step 2: Get API Credentials

1. Once project is ready, click on **Settings** (gear icon in sidebar)
2. Click **API** in the settings menu
3. You'll see:
   - **Project URL** (e.g., `https://abcdefghijk.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - click to reveal)

Keep this page open - you'll need these values in the next step.

---

## Step 3: Configure Environment Variables

1. In your project root, create a file named `.env.local`
2. Copy the following and replace the placeholder values:

```bash
# From Supabase Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key-here

# Anthropic API (optional for now - needed later for AI summaries)
ANTHROPIC_API_KEY=sk-ant-your-key-here
AI_MODEL=claude-3-5-sonnet-20241022
AI_MAX_TOKENS=4096

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Save the file

---

## Step 4: Run Database Migrations

### Option A: Using SQL Editor (Recommended)

1. In Supabase dashboard, click **SQL Editor** (in sidebar)
2. Click **"New query"**
3. **Migration 1 - Initial Schema:**
   - Open `supabase/migrations/001_initial_schema.sql` in your editor
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **"Run"**
   - You should see "Success. No rows returned"

4. **Migration 2 - RLS Policies:**
   - Click **"New query"** again
   - Open `supabase/migrations/002_rls_policies.sql`
   - Copy and paste contents
   - Click **"Run"**
   - You should see "Success. No rows returned"

5. **Migration 3 - Seed Data:**
   - Click **"New query"** again
   - Open `supabase/migrations/003_seed_data.sql`
   - Copy and paste contents
   - Click **"Run"**
   - You should see "Success. No rows returned"

6. **Verify tables were created:**
   - Click **Table Editor** (in sidebar)
   - You should see all the tables: users, life_areas, commitments, questions, etc.

---

## Step 5: Create User Accounts

### 5a. Create Auth Users

1. In Supabase dashboard, go to **Authentication** > **Users**
2. Click **"Add user"** > **"Create new user"**
3. For each of the 4 group members, fill in:
   - **Email**: (their email address)
   - **Password**: (either generate or create a password)
   - **Auto Confirm User**: ✅ CHECK THIS BOX
   - Click **"Create user"**
4. Repeat for all 4 members
5. **Important**: Copy each user's UUID (the `id` column) - you'll need this in the next step

### 5b. Create User Profiles

1. Go back to **SQL Editor**
2. Click **"New query"**
3. For each user you created, run this SQL (replace the values):

```sql
-- User 1
INSERT INTO public.users (id, email, full_name, display_name)
VALUES (
  'paste-user-uuid-from-auth-table-here',
  'user1@example.com',
  'John Doe',
  'John'
);

-- User 2
INSERT INTO public.users (id, email, full_name, display_name)
VALUES (
  'paste-user-uuid-from-auth-table-here',
  'user2@example.com',
  'Bob Smith',
  'Bob'
);

-- User 3
INSERT INTO public.users (id, email, full_name, display_name)
VALUES (
  'paste-user-uuid-from-auth-table-here',
  'user3@example.com',
  'Mike Johnson',
  'Mike'
);

-- User 4
INSERT INTO public.users (id, email, full_name, display_name)
VALUES (
  'paste-user-uuid-from-auth-table-here',
  'user4@example.com',
  'Dave Williams',
  'Dave'
);
```

4. Click **"Run"**
5. Go to **Table Editor** > **users** to verify all 4 users are there

---

## Step 6: Test the Application

1. In your terminal, make sure you're in the project directory:
   ```bash
   cd /Users/Nathan/projects/the6connect
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to: [http://localhost:3000](http://localhost:3000)

4. You should be redirected to the login page: [http://localhost:3000/login](http://localhost:3000/login)

5. Try logging in with one of the user accounts you created:
   - **Email**: (the email you entered)
   - **Password**: (the password you set)

6. After successful login, you should see:
   - The dashboard with navigation sidebar
   - Welcome message with the user's name
   - Empty state cards for Activity, Commitments, Messages

---

## Troubleshooting

### "Invalid login credentials"
- Double-check the email and password
- Make sure "Auto Confirm User" was checked when creating the user
- Verify the user exists in Authentication > Users

### "User not found" or missing profile
- Make sure you ran the INSERT statement for the user profile
- Check Table Editor > users to see if the profile exists
- The user's UUID in the `users` table must match their UUID in the auth.users table

### Environment variables not loading
- Make sure the file is named `.env.local` (not `.env.local.txt`)
- Restart the dev server after creating/editing .env.local
- Check for typos in the environment variable names

### Tables not showing up
- Make sure all 3 migration files ran successfully
- Check for error messages in the SQL Editor
- Go to Table Editor to verify tables exist

---

## What's Next?

Once you've successfully logged in and see the dashboard:

1. **Verify navigation works** - Click through all the menu items
2. **Test multiple users** - Try logging out and logging in as different users
3. **Check the profile link** - Click on your name in the sidebar

Then we can proceed to **Phase 2: Life Status, Commitments & Profiles** to start building the actual features!
