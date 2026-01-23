# the6connect

Private accountability platform for a 4-person men's group supporting connection, accountability, and growth.

## Features

- **Private Messaging** - Direct messages between group members
- **Life Status Tracking** - Monitor progress across Personal Growth, Finances, Business, and Goals
- **Commitments** - Set and track personal commitments with accountability
- **Questions & Answers** - Reflective questions for the group
- **AI Exchange Sharing** - Share insights from AI coaching conversations
- **AI-Powered Summaries** - Generated summaries of member progress
- **Schedule Coordination** - Coordinate group meetings and availability

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Database**: Supabase (PostgreSQL + Auth + Real-time)
- **AI**: Anthropic Claude API
- **Deployment**: Vercel

## Setup

**First time setup?** Follow the comprehensive guide in [SETUP.md](./SETUP.md)

Quick steps:
1. Create a Supabase project
2. Configure `.env.local` with your credentials
3. Run database migrations
4. Create user accounts
5. Start the dev server: `npm run dev`

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
the6connect/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/           # Protected dashboard pages
│   │   ├── messages/
│   │   ├── life-status/
│   │   ├── commitments/
│   │   ├── questions/
│   │   ├── ai-exchanges/
│   │   ├── summaries/
│   │   ├── schedule/
│   │   └── profile/
│   └── api/                   # API routes (coming soon)
├── components/
│   └── layout/                # Navigation, sidebar
├── lib/
│   ├── supabase/             # Database client utilities
│   ├── ai/                   # AI integration
│   └── utils/                # Helper functions
├── supabase/
│   └── migrations/           # Database schema
└── types/                    # TypeScript types
```

## Database Schema

Core tables:
- `users` - User profiles
- `life_areas` - Life tracking categories
- `life_status_updates` - Status tracking history
- `commitments` - User commitments/goals
- `direct_messages` - Private messaging
- `questions` & `question_answers` - Q&A system
- `ai_exchanges` - Shared AI conversations
- `personal_summaries` - AI-generated summaries
- `schedule_events` & `schedule_responses` - Event coordination
- `activity_log` - Audit trail

## Environment Variables

See `.env.example` for required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`

## Implementation Status

✅ **Phase 1: Foundation** (Complete)
- Database schema and RLS policies
- Authentication system
- Dashboard layout with navigation
- Empty state pages

🚧 **Phase 2: Life Status & Commitments** (Next)
- Life status tracking
- Commitments feature
- Profile pages

📋 **Upcoming Phases:**
- Questions & Messaging
- AI Exchanges & Schedule
- AI Summary Generation
- Polish & History

## License

Private project for 4-person men's accountability group.
