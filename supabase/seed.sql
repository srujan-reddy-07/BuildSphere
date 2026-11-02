-- ============================================================
-- BuildSphere – Demo Seed Data
-- ============================================================

-- Enable pgcrypto for password hashing if not already available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- 1. Demo Accounts in auth.users
-- Passwords are encrypted here and documented in README.md
-- ------------------------------------------------------------

-- Demo Talent: demo-talent@example.com
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'demo-talent@example.com',
  crypt('<set-in-env>', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Arjun Sharma","role":"talent"}'::jsonb,
  now(),
  now(),
  'authenticated',
  'authenticated'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = now();

-- Demo Business: demo-business@example.com
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'demo-business@example.com',
  crypt('<set-in-env>', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"DevCraft Technologies","company_name":"DevCraft Technologies","role":"business"}'::jsonb,
  now(),
  now(),
  'authenticated',
  'authenticated'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = now();

-- ------------------------------------------------------------
-- 2. Profiles
-- ------------------------------------------------------------

-- Talent Profile
INSERT INTO public.profiles (
  id,
  full_name,
  city,
  state,
  bio,
  availability,
  experience_years,
  education,
  role,
  is_verified
)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Arjun Sharma',
  'Bengaluru',
  'Karnataka',
  'Full-stack engineer building production Next.js, TypeScript, and modern React apps. Passionate about developer tooling and performance.',
  'full-time',
  2,
  '[{"institution": "RV College of Engineering", "degree": "B.Tech Computer Science", "year": "2024"}]'::jsonb,
  'user',
  true
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  bio = EXCLUDED.bio,
  availability = EXCLUDED.availability,
  experience_years = EXCLUDED.experience_years;

-- Business Profile
INSERT INTO public.profiles (
  id,
  full_name,
  city,
  state,
  bio,
  role,
  is_verified
)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'DevCraft Technologies',
  'Bengaluru',
  'Karnataka',
  'DevCraft Technologies is a fast-growing developer tooling startup based in Indiranagar, Bengaluru.',
  'business',
  true
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  city = EXCLUDED.city,
  role = EXCLUDED.role,
  is_verified = true;

-- ------------------------------------------------------------
-- 3. Business Record (Pre-Verified for Demo)
-- ------------------------------------------------------------

INSERT INTO public.businesses (id, name, description, website, verified)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'DevCraft Technologies',
  'DevCraft Technologies builds high-performance cloud developer tools and full-stack software from Bengaluru.',
  'https://devcraft.example.com',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  verified = true;

-- ------------------------------------------------------------
-- 4. Skills Pool
-- ------------------------------------------------------------

INSERT INTO public.skills (name, category)
VALUES
  ('JavaScript',        'Programming Languages'),
  ('TypeScript',        'Programming Languages'),
  ('React',             'Frontend Development'),
  ('Next.js',           'Frontend Development'),
  ('Tailwind CSS',      'Frontend Development'),
  ('Node.js',           'Backend Development'),
  ('Python',            'Programming Languages'),
  ('UI/UX Design',      'Design'),
  ('Figma',             'Design'),
  ('Data Analysis',     'Data & Analytics'),
  ('Machine Learning',  'Data & Analytics'),
  ('SQL',               'Database & Infrastructure'),
  ('PostgreSQL',        'Database & Infrastructure'),
  ('Flutter',           'Mobile Development'),
  ('Digital Marketing', 'Growth & Marketing')
ON CONFLICT (name) DO NOTHING;

-- ------------------------------------------------------------
-- 5. User Skills for Demo Talent (Arjun Sharma)
-- ------------------------------------------------------------

INSERT INTO public.user_skills (user_id, skill_id, proficiency)
SELECT
  '11111111-1111-1111-1111-111111111111'::uuid,
  s.id,
  'intermediate'::public.proficiency_level
FROM public.skills s
WHERE s.name IN ('React', 'TypeScript', 'Next.js', 'Node.js', 'Tailwind CSS')
ON CONFLICT (user_id, skill_id) DO NOTHING;

-- ------------------------------------------------------------
-- 6. 10 Realistic Indian Opportunities
-- ------------------------------------------------------------

-- Clean existing seed listings for a clean slate
DELETE FROM public.opportunities WHERE business_id = '22222222-2222-2222-2222-222222222222'::uuid;

INSERT INTO public.opportunities
  (id, business_id, title, description, type, location, is_remote, required_skills, stipend_min, stipend_max, deadline, status)
VALUES

-- 1. Full-time Job – Bengaluru
(
  '33333333-3333-3333-3333-333333333301'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Full Stack Next.js Engineer',
  'We are seeking an energetic Full Stack Engineer to build core modules for our developer productivity suite. You will design App Router pages, server actions, and Supabase database schemas. Experience with TypeScript and Tailwind CSS is essential.',
  'job',
  'Bengaluru, Karnataka',
  false,
  ARRAY['Next.js', 'TypeScript', 'React', 'Tailwind CSS', 'Node.js'],
  60000,
  95000,
  '2026-12-31',
  'open'
),

-- 2. Internship – Bengaluru
(
  '33333333-3333-3333-3333-333333333302'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Frontend Developer Intern',
  'Join our 6-month product engineering internship. You will work side-by-side with senior architects building modern UI component libraries in React and Tailwind CSS. Ideal for final-year students and fresh graduates.',
  'internship',
  'Bengaluru, Karnataka',
  false,
  ARRAY['React', 'JavaScript', 'Tailwind CSS'],
  25000,
  35000,
  '2026-12-15',
  'open'
),

-- 3. Freelance Contract – Remote
(
  '33333333-3333-3333-3333-333333333303'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'UI/UX Product Designer (Freelance)',
  'Looking for a passionate product designer to revamp our web platform navigation, dashboard visuals, and onboarding flow. Deliverables include wireframes, interactive Figma prototypes, and design specs.',
  'freelance',
  'Remote',
  true,
  ARRAY['UI/UX Design', 'Figma'],
  40000,
  60000,
  '2026-12-20',
  'open'
),

-- 4. Real-World Project – Remote
(
  '33333333-3333-3333-3333-333333333304'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Real-World Open Source Contributor',
  'Collaborate with developers across India on an open-source data analytics engine. Contributors will receive mentorship, project certificates, and potential hiring fast-tracks.',
  'project',
  'Remote',
  true,
  ARRAY['TypeScript', 'Node.js', 'SQL'],
  15000,
  20000,
  '2027-01-15',
  'open'
),

-- 5. Full-time Job – Mumbai
(
  '33333333-3333-3333-3333-333333333305'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Backend Engineer (Node.js & PostgreSQL)',
  'Build reliable REST APIs, database queries, and caching infrastructure for a high-volume financial services portal in Bandra-Kurla Complex (BKC), Mumbai.',
  'job',
  'Mumbai, Maharashtra',
  false,
  ARRAY['Node.js', 'PostgreSQL', 'SQL', 'TypeScript'],
  70000,
  110000,
  '2026-12-28',
  'open'
),

-- 6. Internship – Pune
(
  '33333333-3333-3333-3333-333333333306'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Data Science & Analytics Intern',
  'Clean and analyze customer activity telemetry, build predictive dashboards, and assist with exploratory ML models using Python and Pandas.',
  'internship',
  'Pune, Maharashtra',
  false,
  ARRAY['Python', 'Data Analysis', 'SQL'],
  20000,
  28000,
  '2026-12-18',
  'open'
),

-- 7. Full-time Job – Hyderabad
(
  '33333333-3333-3333-3333-333333333307'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Mobile App Developer (Flutter/React Native)',
  'Develop and publish responsive mobile experiences for iOS and Android. Integrate background push notifications and offline-first data synchronization.',
  'job',
  'Hyderabad, Telangana',
  false,
  ARRAY['Flutter', 'JavaScript', 'TypeScript'],
  55000,
  85000,
  '2027-01-10',
  'open'
),

-- 8. Internship – Delhi NCR
(
  '33333333-3333-3333-3333-333333333308'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'AI / Machine Learning Engineering Intern',
  'Help fine-tune LLM prompts, benchmark embedding models, and deploy lightweight inference pipelines for conversational Indian languages.',
  'internship',
  'Noida / Delhi NCR',
  true,
  ARRAY['Python', 'Machine Learning', 'Data Analysis'],
  30000,
  45000,
  '2026-12-25',
  'open'
),

-- 9. Freelance Contract – Chennai
(
  '33333333-3333-3333-3333-333333333309'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Freelance Technical Content Writer',
  'Write developer tutorials, API integration walk-throughs, and system architecture guides for modern web applications.',
  'freelance',
  'Chennai, Tamil Nadu',
  true,
  ARRAY['JavaScript', 'React', 'Digital Marketing'],
  25000,
  35000,
  '2027-01-05',
  'open'
),

-- 10. Real-World Project – Remote
(
  '33333333-3333-3333-3333-333333333310'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Community Web Portal Fellowship',
  'Build real-world features for regional student clubs. You will collaborate in Git worktrees, write automated Jest tests, and deploy to Vercel.',
  'project',
  'Remote',
  true,
  ARRAY['React', 'Next.js', 'Tailwind CSS'],
  12000,
  18000,
  '2027-01-25',
  'open'
);

-- ------------------------------------------------------------
-- 7. Sample Application (Demo Talent -> Opportunity #1)
-- Links the prototype flow so Business sees applicant count
-- ------------------------------------------------------------

INSERT INTO public.applications (
  id,
  opportunity_id,
  user_id,
  note,
  status,
  created_at
)
VALUES (
  '44444444-4444-4444-4444-444444444444'::uuid,
  '33333333-3333-3333-3333-333333333301'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Hi DevCraft team! I have built several production Next.js apps with TypeScript and Tailwind CSS. I would love to contribute to your developer productivity suite.',
  'pending',
  now()
)
ON CONFLICT (opportunity_id, user_id) DO NOTHING;

-- ------------------------------------------------------------
-- 8. 5 Curated Learning Resources (Public Hub)
-- ------------------------------------------------------------

DELETE FROM public.resources;

INSERT INTO public.resources (title, category, difficulty, url, description)
VALUES
  (
    'React Official Interactive Documentation',
    'Web Development',
    'beginner',
    'https://react.dev/learn',
    'Master modern React: functional components, state management, hooks, and clean composition patterns with live browser sandboxes.'
  ),
  (
    'Python for Data Science by Kaggle',
    'Data Science',
    'intermediate',
    'https://www.kaggle.com/learn/python',
    'Hands-on micro-course covering Python syntax, Pandas DataFrames, data cleaning, and statistical visualizations for data analysts.'
  ),
  (
    'Google UX Design Professional Certificate',
    'UI/UX Design',
    'beginner',
    'https://www.coursera.org/specializations/ui-ux-design',
    'Covers empathetic design thinking, wireframing in Figma, accessibility principles, and building an industry-grade portfolio.'
  ),
  (
    'System Design Primer by Donne Martin',
    'System Design',
    'advanced',
    'https://github.com/donnemartin/system-design-primer',
    'Comprehensive guide on distributed systems architectures, database sharding, caching strategies, and scalability fundamentals.'
  ),
  (
    'Generative AI for Everyone by Andrew Ng',
    'Marketing',
    'beginner',
    'https://www.deeplearning.ai/courses/generative-ai-for-everyone/',
    'Understand how LLMs and generative AI tools operate, what they can and cannot do, and how to apply them across modern workflows.'
  );

-- ------------------------------------------------------------
-- 9. Sample Community Posts
-- ------------------------------------------------------------

DELETE FROM public.posts;

INSERT INTO public.posts (user_id, content, likes)
VALUES
  (
    '22222222-2222-2222-2222-222222222222'::uuid,
    '👋 DevCraft Technologies is officially hiring Next.js engineers and design interns across India! Check out our openings in the Opportunities tab.',
    14
  ),
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '🚀 Just published a demo project built with Next.js 16 and Supabase! Excited to connect with other builders across Bengaluru and India.',
    8
  ),
  (
    '22222222-2222-2222-2222-222222222222'::uuid,
    '💡 Quick advice for engineering applicants: Tailor your cover note with 1-2 projects you built yourself. Real code speaks louder than buzzwords!',
    21
  );
