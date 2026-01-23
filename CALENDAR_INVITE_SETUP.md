# Calendar Invite Setup Instructions

The calendar invite feature requires Resend email service configuration.

## 1. Sign Up for Resend

1. Go to https://resend.com/signup
2. Create a free account
3. Verify your email address

## 2. Get API Key

1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it: "The6Connect Calendar Invites"
4. Copy the API key (starts with `re_`)

## 3. Add to Vercel Environment Variables

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add new variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: (paste the API key from Resend)
   - **Environment**: All (Production, Preview, Development)
3. Click **Save**
4. **Redeploy** the site for the variable to take effect

## 4. Configure Email Domain (Optional but Recommended)

By default, emails will be sent from `noreply@the6connect.com` but will appear as "via resend.dev"

To remove this and use your own domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `the6connect.com`)
4. Add the provided DNS records to your domain registrar
5. Wait for verification (can take up to 48 hours)
6. Once verified, update the `from` field in the API to use your domain

**For now**: The feature will work with the default sending domain, emails will just show "via resend.dev"

## 5. Test It

1. Deploy to Vercel with the `RESEND_API_KEY` environment variable
2. Create a test event on the Schedule page
3. Click "Email calendar invite to The Six"
4. Confirm the dialog
5. Check your email - you should receive a calendar invite with an .ics attachment

## Free Tier Limits

Resend free tier includes:
- 3,000 emails/month
- 100 emails/day

This is more than enough for your 4-user app sending occasional calendar invites.

## Troubleshooting

- **"Failed to send emails"**: Check that RESEND_API_KEY is set in Vercel
- **Emails not arriving**: Check spam folder
- **"via resend.dev" in email**: This is normal without domain verification
