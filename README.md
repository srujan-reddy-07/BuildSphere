# BuildSphere 🇮🇳

> **An India-wide talent and opportunity network connecting ambitious students, developers, designers, and freelancers with verified businesses, startups, and real-world projects.**

---

## 🌟 Overview

**BuildSphere** is a modern, responsive web MVP tailored for the Indian talent ecosystem. It bridges the gap between skilled individuals across India (tier 1 to tier 3 cities) and hiring companies by providing transparent job/internship listings, smart skill matching, an open learning repository, and a vibrant community hub.

---

## 🚀 Core Features

1. **Authentication**
   - Sign up and log in using email & password (phone OTP is coming soon, pending SMS provider setup).
   - Seamless session management via `@supabase/ssr` cookies and Next.js middleware.

2. **Rich Profile & Completeness Indicator**
   - Personal details (Full Name, City from 20+ Indian metro and tech hubs, State, Bio).
   - Dynamic tag input for technical & design skills.
   - Work availability status (`Full-Time`, `Part-Time`, `Freelance`, `Not Available`).
   - Experience years, education entries, resume attachment, and avatar upload.
   - Real-time profile completeness progress bar with actionable guidance.

3. **Opportunity Directory & Filters**
   - Opportunities categorised by type: **Full-Time Job**, **Internship**, **Freelance Contract**, and **Real-World Project**.
   - Filter by opportunity type, Indian location (e.g., Bangalore, Mumbai, Pune, Remote), and required skills.
   - Clear details including stipend in Indian Rupees (`₹`), deadline, and remote tags.

4. **1-Click Application Workflow**
   - Logged-in users can apply directly to listings with a targeted cover note (up to 500 characters).
   - Instant duplicate prevention and feedback.
   - Dedicated **My Applications** dashboard to track real-time status: `Pending`, `Reviewed`, `Accepted`, `Rejected`.

5. **Business Posting & Listing Management**
   - Verified business accounts can create, edit, manage, and close listings.
   - Track application counts per opening.

6. **Automated Skill Matching & Recommendations**
   - Dynamic **"Recommended for you"** engine powered by skill overlap algorithms (`lib/matching.ts`).
   - Opportunity ranking by percentage match score (`0% - 100%`).
   - High-demand **"Skills to Learn Next"** suggestions based on real-time market data across open listings.

7. **Free Learning Hub**
   - Publicly accessible resource repository (no login required).
   - Categorized across Web Development, Data Science, UI/UX Design, System Design, and Marketing.
   - Filterable by topic and difficulty level (`Beginner`, `Intermediate`, `Advanced`).

8. **Community Feed**
   - Interactive discussion feed for developers and students to share milestones, showcase projects, and seek advice.
   - Post creation, expandable text (likes coming soon).

9. **Claude AI Assistant Integration**
   - Claude-powered 2-3 sentence professional profile summary generation.
   - AI-driven skill suggestions based on current skills and target career roles.

10. **Multilingual Architecture (i18n)**
    - Built with localization support in mind (`/messages/en.json` and `/messages/hi.json`).
    - English and Hindi dictionaries exist; the language switcher is not yet enabled.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Server Actions, Route Handlers)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS (Mobile-first, Custom Indian Orange & Emerald Palette)
- **Database & Auth:** Supabase (PostgreSQL 15, Row-Level Security, Storage Buckets)
- **AI Engine:** Anthropic Claude API (`@anthropic-ai/sdk`, claude-sonnet-4-5)
- **Payments:** Razorpay API Stub (`/api/payments/create-order`, stub; test mode only)
- **Testing:** Jest & ts-jest (33 unit tests for matching algorithms)

---

## 📁 Project Structure

```
buildsphere/
├── __tests__/                  # Unit tests (Jest)
│   └── matching.test.ts        # 33 unit tests for skill matching
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Authentication routes
│   │   ├── login/              # Email & Phone OTP login
│   │   ├── signup/             # Talent & Business registration
│   │   └── layout.tsx
│   ├── (main)/                 # Main application routes
│   │   ├── business/manage/    # Business opportunity management
│   │   ├── community/          # Community discussion feed
│   │   ├── dashboard/          # User dashboard with completeness score
│   │   ├── hub/                # Public Free Learning Hub
│   │   ├── my-applications/    # Application tracking dashboard
│   │   ├── opportunities/      # Directory, filters & details
│   │   │   └── [id]/           # Detail page and application form
│   │   ├── post-opportunity/   # Listing creation page
│   │   ├── profile/            # Profile editor with AI summary
│   │   ├── recommended/        # Skill-ranked recommendations
│   │   └── layout.tsx
│   ├── api/                    # API Route Handlers
│   │   ├── ai/profile-summary/ # Claude AI profile summary
│   │   ├── ai/suggest-skills/  # Claude AI skill suggestion
│   │   └── payments/           # Razorpay payment stub
│   ├── layout.tsx              # Root HTML shell, Navbar, Toaster
│   └── page.tsx                # High-conversion Landing Page
├── components/                 # Reusable UI & Feature components
│   ├── community/              # PostCard, Feed components
│   ├── layout/                 # Navbar, Footer
│   ├── matching/               # RecommendedOpportunities
│   ├── opportunities/          # OpportunityCard, OpportunitiesFilters
│   ├── profile/                # CompletenessBar
│   └── ui/                     # Button, Badge, Card, Input, SkillTag
├── lib/                        # Shared utilities
│   ├── ai.ts                   # Anthropic Claude SDK integration
│   ├── matching.ts             # Skill match scoring & ranking logic
│   ├── utils.ts                # Date formatting, profile completeness
│   └── supabase/               # Browser, Server, & Middleware clients
├── messages/                   # Localization dictionaries
│   ├── en.json                 # English strings
│   └── hi.json                 # Hindi (हिंदी) translations
└── supabase/                   # Database schemas
    ├── migrations/             # PostgreSQL schema with RLS
    └── seed.sql                # 10 Indian opportunities & 5 learning resources
```

---

## 🎯 Demo Prototype Accounts

For live testing and reviewer walkthroughs, the seed data provisions two pre-configured accounts:

| Role | Email | Password | Pre-configured State |
| :--- | :--- | :--- | :--- |
| **Demo Talent** | `demo-talent@example.com` | Set via `DEMO_TALENT_PASSWORD` env var | Arjun Sharma, 2 yrs exp, skills listed, 1 active application |
| **Demo Business** | `demo-business@example.com` | Set via `DEMO_BUSINESS_PASSWORD` env var | DevCraft Technologies, verified employer, 10 open listings, 1 applicant |

> **Quick Demo Sign-in:** On `/login`, click the **"⚡ Try the Demo (Talent)"** or **"💼 Try Demo (Business)"** button for instant one-click authentication. When signed in with a demo account, a banner indicates: `Prototype — demo data`.

---

## 🔒 Business Verification Policy (Task 1 Security)

To prevent spam listings, new business accounts registered through the client default to `verified = false`. By Row-Level Security policy, only verified businesses can publish opportunities.

### How to verify a business account:

1. **Option A (SQL Update in Supabase SQL Editor):**
   ```sql
   UPDATE public.businesses
   SET verified = true
   WHERE id = '<business-user-uuid>';
   ```

2. **Option B (Server-side Admin API):**
   ```bash
   curl -X POST http://localhost:3000/api/admin/verify-business \
     -H "Content-Type: application/json" \
     -H "x-admin-key: <ADMIN_SECRET_KEY>" \
     -d '{"businessId": "<business-user-uuid>", "verified": true}'
   ```
   *Note: This route runs strictly on the server and checks ADMIN_SECRET_KEY or admin user role before verifying.*

---

## ⚙️ Environment Variables

Create a `.env.local` file in the project root based on `.env.local.example`:

| Variable | Required | Description |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL (e.g. `https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public anonymous API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Supabase service role key (for server admin operations) |
| `ADMIN_SECRET_KEY` | Optional | Secret key for server-side admin business verification (<set-in-env>) |
| `ANTHROPIC_API_KEY` | Yes | Anthropic Claude API key for AI summaries & skills |
| `RAZORPAY_KEY_ID` | Optional | Razorpay key ID (`rzp_test_...` for test payments) |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay secret key |
| `NEXT_PUBLIC_APP_URL` | Optional | Public application URL (`http://localhost:3000`) |
| `DEMO_TALENT_PASSWORD` | Optional | Password for 1-click talent demo login (<set-in-env>) |
| `DEMO_BUSINESS_PASSWORD` | Optional | Password for 1-click business demo login (<set-in-env>) |

---

## 🗄️ Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** tab in your Supabase dashboard.
3. Run the schema migration:
   - Copy contents of `supabase/migrations/001_initial_schema.sql` and execute.
   - This creates tables (`profiles`, `skills`, `user_skills`, `businesses`, `opportunities`, `applications`, `resources`, `posts`), enum types, triggers, and comprehensive **Row-Level Security (RLS)** policies.
4. Run the seed data script:
   - Copy contents of `supabase/seed.sql` and execute.
   - This populates **10 sample opportunities** across Mumbai, Bangalore, Delhi, Hyderabad, Pune, and Chennai, **5 learning resources**, and sample community posts.

### 🛡️ Row-Level Security (RLS) Summary
- **`profiles`:** Publicly readable; users can only modify their own row (`auth.uid() = id`).
- **`user_skills`:** Publicly readable; users can only manage their own skills.
- **`opportunities`:** Open listings visible to all; creation restricted to verified businesses; editing restricted to the posting business.
- **`applications`:** Strictly private; visible only to the applicant and the company offering the opportunity.
- **`resources`:** Public read access for everyone (signed-in or anonymous).
- **`posts`:** Public read access; authenticated users can insert and update their own posts.

---

## 🧪 Running Tests

To run the Jest test suite for the matching algorithm:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage Highlights
- ✅ **`computeMatchScore`**: Tests 100% overlap, 0% overlap, neutral case (50 for empty requirements), partial fractions, case-insensitivity (`React` vs `react`), whitespace normalization, and duplicate handling.
- ✅ **`rankOpportunities`**: Verifies descending score sorting, correct extraction of matched vs missing skills, company fallbacks, and alphabetical tiebreakers.
- ✅ **`suggestSkills`**: Verifies frequency-weighted missing skill discovery, deduplication against existing profile skills, and top-N limits.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Localization (Hindi & Regional Languages)

BuildSphere structures UI copy into locale dictionary files in `/messages/`:
- `en.json` — English (Default)
- `hi.json` — Hindi (हिंदी)

To add additional Indian languages (e.g. Tamil, Telugu, Marathi, Bengali), simply add a corresponding JSON dictionary in `/messages/[lang].json`.

---

## 💳 Razorpay Payments (Stub to Production)

BuildSphere includes an endpoint at `/api/payments/create-order` designed for employer listing packages and premium talent features. To switch from stub to production:
1. `npm install razorpay`
2. Configure `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env.local`.
3. In `/api/payments/create-order/route.ts`, initialize the client with `new Razorpay({ ... })` and call `razorpay.orders.create({ amount, currency: 'INR' })`.

---

## 📄 License

MIT © BuildSphere India
