/**
 * Migrate 90-Day Game Data from CSVs
 *
 * Run this once to populate the Oct 8 - Dec 31, 2025 game with historical data
 *
 * Usage: npx tsx scripts/migrate-90day-game-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// User IDs mapping (get these from your users table)
const USER_IDS = {
  nathan: '', // Fill these in after querying
  andrew: '',
  traver: '',
  joseph: ''
};

async function getUserIds() {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, full_name')
    .order('full_name');

  if (error) throw error;

  console.log('Found users:', users);

  // Map users by first name
  users?.forEach(user => {
    const firstName = user.full_name.split(' ')[0].toLowerCase();
    if (firstName === 'nathan') USER_IDS.nathan = user.id;
    if (firstName === 'andrew') USER_IDS.andrew = user.id;
    if (firstName === 'traver') USER_IDS.traver = user.id;
    if (firstName === 'joseph') USER_IDS.joseph = user.id;
  });

  console.log('User IDs:', USER_IDS);
}

async function createGame() {
  console.log('\n1. Creating game...');

  const { data: game, error } = await supabase
    .from('games')
    .insert({
      start_date: '2025-10-08',
      end_date: '2025-12-31',
      status: 'completed',
      created_by_user_id: USER_IDS.nathan
    })
    .select()
    .single();

  if (error) throw error;

  console.log('✓ Game created:', game.id);
  return game.id;
}

async function createParticipants(gameId: string) {
  console.log('\n2. Creating participants...');

  const participants = [
    {
      game_id: gameId,
      user_id: USER_IDS.nathan,
      opted_in: true,
      game_name: 'D.O. or Die',
      setup_complete: true
    },
    {
      game_id: gameId,
      user_id: USER_IDS.andrew,
      opted_in: true,
      game_name: 'Foundation Year',
      setup_complete: true
    },
    {
      game_id: gameId,
      user_id: USER_IDS.traver,
      opted_in: true,
      game_name: 'Revenue Reset',
      setup_complete: true
    },
    {
      game_id: gameId,
      user_id: USER_IDS.joseph,
      opted_in: true,
      game_name: 'CURED Exit',
      setup_complete: true
    }
  ];

  const { error } = await supabase
    .from('game_participants')
    .insert(participants);

  if (error) throw error;

  console.log('✓ Participants created');
}

// Nathan's data
async function migrateNathan(gameId: string) {
  console.log('\n3. Migrating Nathan Otto...');
  const userId = USER_IDS.nathan;

  // Vision
  await supabase.from('game_vision_statements').insert({
    game_id: gameId,
    user_id: userId,
    content: "Direct Outcomes is financially independent and gaining momentum. Foundations and nonprofits are actively funding and using the platform. Our partnerships are growing, platform revenue is climbing, and small donor dashboards are helping nonprofits stabilize and scale their impact with confidence.",
    completion_percentage: 33
  });

  // Why
  await supabase.from('game_why_statements').insert({
    game_id: gameId,
    user_id: userId,
    content: "I want to stop draining my personal finances to fund this vision and instead experience the relief and freedom that come from DO sustaining itself. I want the deep personal satisfaction of seeing a Big Idea—my idea—take root and begin to transform how philanthropy works. And I want to be known for it. I want my leadership, creativity, and clarity to be recognized as a meaningful contribution to the world.",
    completion_percentage: 25
  });

  // Objective
  await supabase.from('game_objectives').insert({
    game_id: gameId,
    user_id: userId,
    content: "Transition Direct Outcomes from founder-funded to externally-backed through customer-based funding and strategic partnerships.",
    completion_percentage: 25
  });

  // Key Results
  const keyResults = [
    {
      game_id: gameId,
      user_id: userId,
      description: "KR 1: Secure a run-rate of $20,000/month (excluding direct contract costs) from nonprofit integration work, foundation partnerships, and capacity grants, allocated to cover Direct Outcomes' core operational expenses, and secure this funding for at least one year.",
      weight_percentage: 20,
      completion_percentage: 50,
      notes: '',
      sort_order: 1
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "KR 2: Generate $10,000/month in revenue from 10% platform fees tied to fulfilled Standardized Micro-Grants (SMGs), representing $100,000/month in validated impact.",
      weight_percentage: 50,
      completion_percentage: 10,
      notes: '',
      sort_order: 2
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "KR 3: Establish a long-term financial support relationship with at least one foundation or philanthropic services organization.",
      weight_percentage: 30,
      completion_percentage: 50,
      notes: 'Created one-pager for foundations.',
      sort_order: 3
    }
  ];

  await supabase.from('game_key_results').insert(keyResults);

  // Projects
  const projects = [
    {
      game_id: gameId,
      user_id: userId,
      description: "Project 1: Engage 3–5 mid-sized nonprofits with active marketing teams to pilot the Direct Outcomes platform, emphasizing improved small donor retention, increased recurring gifts, and impact transparency.",
      weight_percentage: 25,
      completion_percentage: 50,
      notes: '',
      sort_order: 1
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "Project 2: Develop a partnership and pilot initiative with at least one foundation to offer capacity grants to DO that benefit multiple affiliated nonprofits.",
      weight_percentage: 60,
      completion_percentage: 35,
      notes: 'Larissa Anstey from BCF said that there are many foundations with money for capacity grants.',
      sort_order: 2
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "Project 3: Network within the Association of Fundraising Professionals (AFP) in Colorado to learn and identify AFP members interested in earning commission for introducing DO to qualified nonprofits and foundations.",
      weight_percentage: 15,
      completion_percentage: 100,
      notes: 'Lauren going to AFP coffee to talk about DO.',
      sort_order: 3
    }
  ];

  await supabase.from('game_projects').insert(projects);

  // Inner Game - Limiting
  const limitingItems = [
    { category: 'belief', description: "If I get interrupted or can't dedicate uninterrupted time, I'll lose momentum and fail at my Game.", rating: 4, notes: 'My AI coach really helped with this one.' },
    { category: 'value', description: 'Desire vs obligation', rating: 4, notes: 'Upgraded when I started meditating "please yourself" on a high level.' },
    { category: 'habit', description: 'I habitually put too much energy into the court case for Winston.', rating: 4, notes: "I've gotten ruthless about what I need to do." },
    { category: 'motivator', description: 'Anger and upset at unfair attacks.', rating: 4, notes: '' },
    { category: 'strength', description: 'Over-reliance on Perspectives as a prerequisite for action.', rating: 4, notes: 'Connected to Limiting Value.' },
    { category: 'accountability', description: "If I let someone down emotionally, it means I've failed as a leader or partner.", rating: 3, notes: '' }
  ];

  await supabase.from('game_inner_game_items').insert(
    limitingItems.map((item, idx) => ({
      game_id: gameId,
      user_id: userId,
      item_type: 'limiting',
      ...item,
      sort_order: idx + 1
    }))
  );

  // Inner Game - Empowering
  const empoweringItems = [
    { category: 'belief', description: 'Staying in authentic relationship with my Game reveals what\'s true and what\'s next.', rating: 3, notes: '' },
    { category: 'value', description: 'Sovereignty with Openness', rating: 4, notes: 'Desire becomes trustworthy when aligned with values.' },
    { category: 'habit', description: 'Capture commitments in mobile list, process weekly through AI.', rating: 4, notes: 'This is working pretty well.' },
    { category: 'motivator', description: 'When core values, play and effectiveness combine, I light up for days.', rating: 4, notes: 'Becoming aware than interruptive obligations touch on my core values.' },
    { category: 'strength', description: 'Presence.', rating: 3, notes: 'I want to upgrade this one.' },
    { category: 'accountability', description: 'Get in action, see what works. Finish the job.', rating: 5, notes: 'This one rocks.' }
  ];

  await supabase.from('game_inner_game_items').insert(
    empoweringItems.map((item, idx) => ({
      game_id: gameId,
      user_id: userId,
      item_type: 'empowering',
      ...item,
      sort_order: idx + 1
    }))
  );

  // One Big Things
  const obts = [
    { week_number: 1, description: 'Put a proposal for Direct Outcomes in front of Boulder Community Foundation.', completion_percentage: 100, notes: 'Oct 16 I met with Larissa Anstey.' },
    { week_number: 2, description: 'Get feedback from three outside people on finding a national foundation.', completion_percentage: 100, notes: 'Crushed it with Empowering Accountability Frame.' },
    { week_number: 3, description: 'Follow up with IPI Impact Philanthropy group.', completion_percentage: 100, notes: '' },
    { week_number: 4, description: 'Develop market-making materials for Impact Investing group.', completion_percentage: 100, notes: '' },
    { week_number: 5, description: 'Converse with Casey Verbeck about foundation funding.', completion_percentage: 0, notes: "It's Jan 26, still making progress." },
    { week_number: 6, description: '', completion_percentage: 0, notes: '' }
  ];

  await supabase.from('game_one_big_things').insert(
    obts.map(obt => ({
      game_id: gameId,
      user_id: userId,
      ...obt
    }))
  );

  console.log('✓ Nathan migrated');
}

// Andrew's data
async function migrateAndrew(gameId: string) {
  console.log('\n4. Migrating Andrew Fraser...');
  const userId = USER_IDS.andrew;

  // Vision
  await supabase.from('game_vision_statements').insert({
    game_id: gameId,
    user_id: userId,
    content: "My vision is to transition out of Movement with grace, step into CTG with strength, and grow my coaching practice as a sustainable path toward financial freedom and family stability. I hold a sense of integration — past experience, present work, and future possibilities all aligned.",
    completion_percentage: 70
  });

  // Why
  await supabase.from('game_why_statements').insert({
    game_id: gameId,
    user_id: userId,
    content: "Because I want the freedom of remote work, the security of financial stability, the satisfaction of building a coaching practice that aligns with my values — and the ability to show up fully as a present father.",
    completion_percentage: 70
  });

  // Objective
  await supabase.from('game_objectives').insert({
    game_id: gameId,
    user_id: userId,
    content: "In 90 days, I am confidently established in my new Project Lead role, having transitioned smoothly from Movement and advancing my coaching path as I prepare for fatherhood with stability and purpose.",
    completion_percentage: 70
  });

  // Key Results
  const keyResults = [
    {
      game_id: gameId,
      user_id: userId,
      description: "KR 1: By 10/27, Movement RiNo managers are fully trained and independently handling schedules, payroll, and program operations without my oversight.",
      weight_percentage: 25,
      completion_percentage: 100,
      notes: '',
      sort_order: 1
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "KR 2: EOD clearance paperwork completed and submitted by 10/9.",
      weight_percentage: 15,
      completion_percentage: 100,
      notes: '',
      sort_order: 2
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "KR 3: Two remaining mentor coaching calls scheduled and completed by 12/31.",
      weight_percentage: 10,
      completion_percentage: 40,
      notes: '',
      sort_order: 3
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "KR 4: 50 coaching hours logged and 10 hours of being coached completed by 12/15.",
      weight_percentage: 10,
      completion_percentage: 80,
      notes: '',
      sort_order: 4
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "KR 5: Coaching performance evaluation video submitted by 12/20.",
      weight_percentage: 5,
      completion_percentage: 0,
      notes: '',
      sort_order: 5
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "KR 6: Agile with Jira course completed on Coursera with certificate earned by 11/15.",
      weight_percentage: 15,
      completion_percentage: 65,
      notes: '',
      sort_order: 6
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "KR 7: Transition plan for Movement Gym Director role documented and shared in Asana by 10/24.",
      weight_percentage: 20,
      completion_percentage: 100,
      notes: '',
      sort_order: 7
    }
  ];

  await supabase.from('game_key_results').insert(keyResults);

  // Projects
  const projects = [
    {
      game_id: gameId,
      user_id: userId,
      description: "Project 1: Movement Transition Plan\n\n- Build and share Asana-based transition plan by 10/24\n- Train managers on schedules, payroll, and programming handoffs\n- Document SOPs for continuity",
      weight_percentage: 65,
      completion_percentage: 100,
      notes: '',
      sort_order: 1
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "Project 2: CTG Preparation\n\n- Complete Agile with Jira Coursera course by 11/5\n- Submit all EOD clearance paperwork by 10/9\n- Set up personal systems (calendar, task tracking, Jira fluency) for new role",
      weight_percentage: 20,
      completion_percentage: 90,
      notes: '',
      sort_order: 2
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "Project 3: Coaching Credentialing\n\n- Complete 2 remaining mentor coaching calls by 12/31\n- Log 50 coaching hours and 10 hours of being coached by 12/15\n- Record and submit coaching performance evaluation video by 12/20",
      weight_percentage: 15,
      completion_percentage: 70,
      notes: '',
      sort_order: 3
    }
  ];

  await supabase.from('game_projects').insert(projects);

  // Inner Game - Limiting
  const limitingItems = [
    { category: 'belief', description: "I don't deserve all of this.", rating: 4, notes: '' },
    { category: 'value', description: 'Protect my freedom and likability, even if it means avoiding full ownership.', rating: 4, notes: '' },
    { category: 'habit', description: 'Distract with novelty or pleasure to avoid facing irresponsibility.', rating: 3, notes: '' },
    { category: 'motivator', description: 'Avoid looking bad or being exposed as inadequate.', rating: 4, notes: '' },
    { category: 'strength', description: 'Curiosity and creativity (Learner + Ideation) used to avoid commitment.', rating: 4, notes: '' },
    { category: 'accountability', description: 'Guilt and self-criticism that spiral into shame and avoidance.', rating: 4, notes: '' }
  ];

  await supabase.from('game_inner_game_items').insert(
    limitingItems.map((item, idx) => ({
      game_id: gameId,
      user_id: userId,
      item_type: 'limiting',
      ...item,
      sort_order: idx + 1
    }))
  );

  // Inner Game - Empowering
  const empoweringItems = [
    { category: 'belief', description: 'My success expands what\'s possible for everyone.', rating: 4, notes: '' },
    { category: 'value', description: 'Authenticity empowers relationships.', rating: 3, notes: '' },
    { category: 'habit', description: 'Weekly check-ins for reflection and celebration.', rating: 3, notes: '' },
    { category: 'motivator', description: 'To expand what\'s possible for myself and others through meaningful action.', rating: 4, notes: '' },
    { category: 'strength', description: 'Focus + Integrity—channeling my visionary energy through structured follow-through, seeing focus and discipline as creative acts of freedom rather than restriction.', rating: 4, notes: '' },
    { category: 'accountability', description: 'I\'m playing a big game, so I meet risk and failure with focus, learning, and self-compassion.', rating: 4, notes: '' }
  ];

  await supabase.from('game_inner_game_items').insert(
    empoweringItems.map((item, idx) => ({
      game_id: gameId,
      user_id: userId,
      item_type: 'empowering',
      ...item,
      sort_order: idx + 1
    }))
  );

  // One Big Things
  const obts = [
    { week_number: 1, description: 'Complete all requisite steps in background check to get cleared to begin work on FALCON project.', completion_percentage: 100, notes: '' },
    { week_number: 2, description: 'Take time to honor a massive life transition through presence, celebration, ritual, reflection and rest.', completion_percentage: 100, notes: '' },
    { week_number: 3, description: 'Develop familiarity with new work environment and proficiency in using overlapping tools (Jira, Confluence, DevSpeak, etc).', completion_percentage: 100, notes: '' },
    { week_number: 4, description: 'Complete coaching academy assignments, schedule mentor coaching call, complete coaching back-end setup (bank account, tax EIN, QuickBooks account)', completion_percentage: 100, notes: '' },
    { week_number: 5, description: 'Discuss pre-baby priorities with Aubrey & create checklist of important tasks to complete in Q1 next year.', completion_percentage: 0, notes: '' },
    { week_number: 6, description: '', completion_percentage: 0, notes: '' }
  ];

  await supabase.from('game_one_big_things').insert(
    obts.map(obt => ({
      game_id: gameId,
      user_id: userId,
      ...obt
    }))
  );

  console.log('✓ Andrew migrated');
}

// Traver's data
async function migrateTraver(gameId: string) {
  console.log('\n5. Migrating Traver Boehm...');
  const userId = USER_IDS.traver;

  // Vision
  await supabase.from('game_vision_statements').insert({
    game_id: gameId,
    user_id: userId,
    content: "I am a man who pays myself first — steady, strong, and unapologetic. I confidently generate $8–10K/month in aligned, sustainable ways. My personal revenue system is simple and clear, fueling both my freedom and amplifying the mission of UNcivilized.",
    completion_percentage: 60
  });

  // Why
  await supabase.from('game_why_statements').insert({
    game_id: gameId,
    user_id: userId,
    content: "Because my freedom, security, and power as a leader all depend on being financially nourished. Paying myself first breaks the old Nice Guy pattern -- and dismantles my main limiting belief, anchors me in self-respect, and sets a living example for other men of what true value and healthy leadership look like.",
    completion_percentage: 50
  });

  // Objective
  await supabase.from('game_objectives').insert({
    game_id: gameId,
    user_id: userId,
    content: "To design and implement a clear personal income system that consistently pays me at least $8,000/month, while testing and refining which revenue streams (inside and outside of UNcivilized) feel most sustainable and aligned.",
    completion_percentage: 50
  });

  // Key Results
  const keyResults = [
    {
      game_id: gameId,
      user_id: userId,
      description: "KR 1: Generate at least $8,000 in personal income by the end of the 90 days (track monthly averages).",
      weight_percentage: 33,
      completion_percentage: 50,
      notes: '',
      sort_order: 1
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "KR 2: Test and evaluate at least 3 different revenue pathways (e.g., coaching, acupuncture, workshops) and measure income generated from each.",
      weight_percentage: 33,
      completion_percentage: 100,
      notes: '',
      sort_order: 2
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "KR 3: Implement a clear personal pay structure that ensures I consistently pay myself first from any UNcivilized-related income.",
      weight_percentage: 33,
      completion_percentage: 40,
      notes: '',
      sort_order: 3
    }
  ];

  await supabase.from('game_key_results').insert(keyResults);

  // Projects
  const projects = [
    {
      game_id: gameId,
      user_id: userId,
      description: "Project 1: Create a simplified but directed content creation system that leads customers to various products and services so purchases can be made indirectly and without my time and energy.",
      weight_percentage: 33,
      completion_percentage: 80,
      notes: '',
      sort_order: 1
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "Project 2: Enroll at least 4 new one-on-one coaching clients or acupuncture patients outside of UNcivilized channels.",
      weight_percentage: 33,
      completion_percentage: 80,
      notes: '',
      sort_order: 2
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "Project 3: Establish and practice a personal pay-first system for any UNcivilized-related revenue (e.g., auto-transfer a set % into personal account).",
      weight_percentage: 33,
      completion_percentage: 60,
      notes: '',
      sort_order: 3
    }
  ];

  await supabase.from('game_projects').insert(projects);

  // Inner Game - Limiting
  const limitingItems = [
    { category: 'belief', description: "No matter how hard I work, it never truly pays off for me.", rating: 4, notes: '' },
    { category: 'value', description: "Hard work and control are safer than trust and ease.", rating: 4, notes: '' },
    { category: 'habit', description: 'Over-efforting — staying in motion and taking on too much as a way to maintain control and feel safe.', rating: 4, notes: '' },
    { category: 'motivator', description: 'Fear of losing relevance or worth if I slow down — the need to stay productive to feel valuable.', rating: 4, notes: '' },
    { category: 'strength', description: 'Relentless discipline and drive — when fueled by fear or pressure — limit creativity, receptivity, and flow.', rating: 4, notes: '' },
    { category: 'accountability', description: 'Holding myself accountable through pressure and self-judgment — using discipline as punishment instead of as a tool for learning, alignment, and renewal.', rating: 4, notes: '' }
  ];

  await supabase.from('game_inner_game_items').insert(
    limitingItems.map((item, idx) => ({
      game_id: gameId,
      user_id: userId,
      item_type: 'limiting',
      ...item,
      sort_order: idx + 1
    }))
  );

  // Inner Game - Empowering
  const empoweringItems = [
    { category: 'belief', description: 'My work works. My way works. I receive massively as I create.', rating: 4, notes: '' },
    { category: 'value', description: "I value trust and energetic alignment over control and force.", rating: 5, notes: '' },
    { category: 'habit', description: 'Pausing to align before acting — balancing effort with ease and integrating intentional rest into daily rhythms.', rating: 4, notes: '' },
    { category: 'motivator', description: 'To embody and model what conscious, easeful success looks like for a man — leading and creating from aliveness, not pressure.', rating: 4, notes: '' },
    { category: 'strength', description: 'Channeling my drive and endurance through conscious awareness — using intensity as focused presence, not endless effort.', rating: 4, notes: '' },
    { category: 'accountability', description: 'Holding myself accountable through compassion and reflection — honoring progress, integrating lessons, and returning to alignment with my purpose every time I stray.', rating: 4, notes: '' }
  ];

  await supabase.from('game_inner_game_items').insert(
    empoweringItems.map((item, idx) => ({
      game_id: gameId,
      user_id: userId,
      item_type: 'empowering',
      ...item,
      sort_order: idx + 1
    }))
  );

  // One Big Things
  const obts = [
    { week_number: 1, description: 'Sketch out OLSLAI Coaching Program for January.', completion_percentage: 100, notes: '' },
    { week_number: 2, description: 'Finish and share OLSLAI details with team. Sketch out sections of November dark talk.', completion_percentage: 100, notes: '' },
    { week_number: 3, description: 'Write 2 Substack Pieces this month, Shoot 4 YT videos this month.', completion_percentage: 100, notes: '' },
    { week_number: 4, description: 'Fully execute OLSLAI Program for January', completion_percentage: 100, notes: '' },
    { week_number: 5, description: 'Research and book 3 venues for Into The Dark 2026 Talk', completion_percentage: 0, notes: '' },
    { week_number: 6, description: '', completion_percentage: 0, notes: '' }
  ];

  await supabase.from('game_one_big_things').insert(
    obts.map(obt => ({
      game_id: gameId,
      user_id: userId,
      ...obt
    }))
  );

  console.log('✓ Traver migrated');
}

// Joseph's data
async function migrateJoseph(gameId: string) {
  console.log('\n6. Migrating Joseph Sheehey...');
  const userId = USER_IDS.joseph;

  // Vision
  await supabase.from('game_vision_statements').insert({
    game_id: gameId,
    user_id: userId,
    content: "Exit CURED Nutrition successfully and proudly, handing it to new ownership that will continue its growth and impact. I remain anchored on the clarity of this exit, free from fear or second‑guessing, carrying forward the lessons of my first business to step into future ventures as a more seasoned, confident founder.",
    completion_percentage: 80
  });

  // Why
  await supabase.from('game_why_statements').insert({
    game_id: gameId,
    user_id: userId,
    content: "My why is to free myself from the cycle of overwork, fear, and second‑guessing by completing this exit and creating space for the next chapter of my life. This game is about proving to myself that I can build, scale, and hand off a company with clarity and strength—anchoring in the legacy of CURED while preparing for new ventures At its core, my why is freedom: financial freedom for my family, emotional freedom from the grind, and creative freedom to step into new opportunities with seasoned confidence. This exit is not an end, but the bridge into the bigger impact I am here to make.",
    completion_percentage: 90
  });

  // Objective
  await supabase.from('game_objectives').insert({
    game_id: gameId,
    user_id: userId,
    content: "Develop a 90-day Exit Planning Roadmap that identifies the levers to maximize valuation multiples while simultaneously building a streamlined, self-sufficient team infrastructure. The objective is to reduce complexity, reorganize roles, and empower leadership so that CURED Nutrition runs day-to-day with efficiency and clarity. This roadmap must not only define what actions drive higher multiples (churn reduction, cash flow improvements, growth engine refinement) but also ensure who will execute them reliably—laying the foundation for an exit-ready company by late 2026.",
    completion_percentage: 90
  });

  // Key Results
  const keyResults = [
    {
      game_id: gameId,
      user_id: userId,
      description: "KR 1: Growth marketing and lifecycle management systems are fully built and live by week 10, producing measurable outcomes: 15% CAC reduction, churn <18%, and 10% month-over-month subscription revenue growth.",
      weight_percentage: 25,
      completion_percentage: 100,
      notes: '',
      sort_order: 1
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "KR 2: Reduce operational dependence on myself by replacing reactive oversight with structured leadership alignment. Within the 3:1 sprint framework, hold bi-weekly leadership meetings where department leads present project progress and plans, achieving a reduction of founder involvement in operational decisions from ~85% to under 25% by 1/1/26",
      weight_percentage: 25,
      completion_percentage: 100,
      notes: '',
      sort_order: 2
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "KR 3: Equip and empower the leadership team to own execution through teaching and systemization. By week 9, all leadership training and process handoffs are complete, and in Monday all-hands meetings each department consistently identifies KPI trends, proposes focus areas, and reports clear action initiatives.",
      weight_percentage: 25,
      completion_percentage: 100,
      notes: '',
      sort_order: 3
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "KR 4: Maintain a 70/30 strategic:tactical time allocation, dedicating 70% of my energy to the exit strategy. By the end of the 90-day game, a refined high-level company timeline and 2026 go-to-market roadmap are complete, including the pitch decks, advisor scoring framework, and engagement plan preparation",
      weight_percentage: 25,
      completion_percentage: 100,
      notes: '',
      sort_order: 4
    }
  ];

  await supabase.from('game_key_results').insert(keyResults);

  // Projects
  const projects = [
    {
      game_id: gameId,
      user_id: userId,
      description: "Project 1: Read 100M Money Models and complete the pertinent playbooks for marketing systems, fast cash, retention and lifetime value. Ensure each team member is assigned the correct playbook and has clear accountability plan for what is expected to result from their study of the content.",
      weight_percentage: 10,
      completion_percentage: 100,
      notes: '',
      sort_order: 1
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "Project 2: Create the department and team member specific scorecards, expectations for 2026 and team reporting infrastructure. What are the objectives, key results and associated projects of each department and the timeline in which they are expected to be completed.",
      weight_percentage: 75,
      completion_percentage: 100,
      notes: '',
      sort_order: 2
    },
    {
      game_id: gameId,
      user_id: userId,
      description: "Project 3: Create the roadmap and associated checkpoints in order to achieve the desired EBITDA number and coincide the company performance with the external party conversations. Identify the gaps that currently exist between where we are and where we need to go.",
      weight_percentage: 15,
      completion_percentage: 60,
      notes: '',
      sort_order: 3
    }
  ];

  await supabase.from('game_projects').insert(projects);

  // Inner Game - Limiting
  const limitingItems = [
    { category: 'belief', description: 'No me, no momentum or results—standards slip unless I\'m driving', rating: 4, notes: '' },
    { category: 'value', description: 'Urgency & Certainty over Empowered Ownership & Measured Progress.', rating: 4, notes: '' },
    { category: 'habit', description: 'Solution-Snatching: jumping in to solve instead of coaching owners through the problem.', rating: 4, notes: '' },
    { category: 'motivator', description: 'Control to calm anxiety (using urgency as relief).', rating: 4, notes: '' },
    { category: 'strength', description: 'Achiever in overdrive: I carry results instead of building carriers.', rating: 4, notes: '' },
    { category: 'accountability', description: 'If results slip, I catastrophize and take the wheel—stalling the path to a sellable company.', rating: 4, notes: '' }
  ];

  await supabase.from('game_inner_game_items').insert(
    limitingItems.map((item, idx) => ({
      game_id: gameId,
      user_id: userId,
      item_type: 'limiting',
      ...item,
      sort_order: idx + 1
    }))
  );

  // Inner Game - Empowering
  const empoweringItems = [
    { category: 'belief', description: 'I build and empower leaders; they produce the results.', rating: 4, notes: '' },
    { category: 'value', description: 'Process that produces speed and standards.', rating: 4, notes: '' },
    { category: 'habit', description: 'Ask → Align → Assign.', rating: 4, notes: '' },
    { category: 'motivator', description: 'Build people, refine process, make the company sellable.', rating: 4, notes: '' },
    { category: 'strength', description: 'I am the clarity engineer that builds systems for scale.', rating: 4, notes: '' },
    { category: 'accountability', description: 'I maintain a Supportive Specificity Loop to drive owner‑led results with clear guardrails.', rating: 4, notes: '' }
  ];

  await supabase.from('game_inner_game_items').insert(
    empoweringItems.map((item, idx) => ({
      game_id: gameId,
      user_id: userId,
      item_type: 'empowering',
      ...item,
      sort_order: idx + 1
    }))
  );

  // One Big Things
  const obts = [
    { week_number: 1, description: 'Review the 90 day game with my business partner and discuss where I need his collaboration for the projects and key results.', completion_percentage: 100, notes: '' },
    { week_number: 2, description: 'Define all deliverable dates and completion milestones for projects 1-3.', completion_percentage: 100, notes: '' },
    { week_number: 3, description: 'Finalize what done looks like for each departments 2026 planning deliverables. What are the objectives and key results and how are these presented and by when.', completion_percentage: 100, notes: '' },
    { week_number: 4, description: 'BUild the website for NCRCA, launch a campaign and start driving traffic from the CURED customer base to collect testimonial and start fund raising', completion_percentage: 100, notes: '' },
    { week_number: 5, description: 'Flinalize all department playbooks and have all CURED team members complete their 2026 company execution slides includiong objectives, key results and sprints', completion_percentage: 100, notes: '' },
    { week_number: 6, description: 'Finalize complete 2026 company strategy document', completion_percentage: 100, notes: '' }
  ];

  await supabase.from('game_one_big_things').insert(
    obts.map(obt => ({
      game_id: gameId,
      user_id: userId,
      ...obt
    }))
  );

  console.log('✓ Joseph migrated');
}

async function main() {
  try {
    console.log('Starting 90-Day Game data migration...\n');

    await getUserIds();

    if (!USER_IDS.nathan || !USER_IDS.andrew || !USER_IDS.traver || !USER_IDS.joseph) {
      throw new Error('Could not find all user IDs');
    }

    const gameId = await createGame();
    await createParticipants(gameId);
    await migrateNathan(gameId);
    await migrateAndrew(gameId);
    await migrateTraver(gameId);
    await migrateJoseph(gameId);

    console.log('\n✅ Migration complete!');
    console.log(`Game ID: ${gameId}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
