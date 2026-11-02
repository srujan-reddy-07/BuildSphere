# BuildSphere – 5-Minute Prototype Walkthrough 🇮🇳

> **Target Audience:** Mentors, YC Interviewers, and Angel Investors  
> **Total Duration:** 5 Minutes  
> **Core Objective:** Demonstrate the complete end-to-end loop: Candidate Profile & AI Matching → Application Workflow → Employer Listing & Applicant Management → Public Learning Funnel.

---

## ⚡ Pre-Demo Checklist

1. Start development server: `npm run dev`
2. Open browser at: [http://localhost:3000](http://localhost:3000)
3. Confirm demo credentials in `.env.local` or database:
   - **Demo Talent:** `demo-talent@example.com` (Password: `<set-in-env>`)
   - **Demo Business:** `demo-business@example.com` (Password: `<set-in-env>`)

---

## ⏱️ Minute-by-Minute Walkthrough

### 0:00 – 0:45 | The Problem & Fast-Track Demo Login

- **Action:** Open `http://localhost:3000/login`. Point to the orange banner: **"Reviewer & Mentor Fast-Track"**. Click the **"⚡ Try the Demo (Talent)"** button.
- **What to Say:**
  > *"Hiring early-career tech and design talent in India is broken. Thousands of capable students across Tier 1, 2, and 3 engineering colleges are invisible to startups, while founders are flooded with generic resumes. BuildSphere is an India-wide talent and opportunity network built to fix this. For this live demo, I'm using our one-click reviewer fast-track to authenticate as our seeded talent profile, Arjun Sharma."*
- **Visual Proof:** Notice the sticky top banner appears: `⚡ Prototype — demo data (demo-talent@example.com)`.

---

### 0:45 – 1:45 | Profile Completeness & Claude AI Profile Coach

- **Action:** Click **"Profile"** in the top navigation. Show the **Profile Completeness Bar (89%)**. Point out the tag-based skills input (`Next.js`, `React`, `TypeScript`, `Node.js`, `Tailwind CSS`). Click **"✨ Generate AI Summary"**.
- **What to Say:**
  > *"Students often struggle to pitch themselves effectively. BuildSphere features an interactive completeness indicator that guides candidates on what is missing. Furthermore, our native Anthropic Claude integration generates a concise, professional first-person summary based on their verified skills, city, and experience level—giving them a polished bio in seconds."*
- **Visual Proof:** The bio field updates instantly with an AI-crafted summary ready to save.

---

### 1:45 – 2:45 | Skill Matching Engine & 1-Click Application

- **Action:** Navigate to **"Recommended"** (`/recommended`). Point out the **100% Match** and **80% Match** badges, plus the **"🔥 Skills to Learn Next"** section. Click on the top opening: **"Full Stack Next.js Engineer"** at DevCraft Technologies.
- **What to Say:**
  > *"Instead of keyword spam, our pure-function matching engine computes the exact intersection between candidate skills and role requirements. We also identify high-frequency market skills the candidate lacks so they know what to learn next. Let's apply with a tailored note."*
- **Action:** Click **"Apply Now"**, enter: *"I have 2 years of hands-on Next.js experience and built several open-source modules. Would love to join DevCraft."* Click **"Submit Application"**.
- **Action:** It auto-redirects to **"My Applications"** (`/my-applications`).
- **Visual Proof:** Show the application card categorized under **"Pending"** with the submitted timestamp and cover note preview.

---

### 2:45 – 3:45 | Employer Console: Post Opening & View Applicants

- **Action:** Click user avatar → **"Sign Out"**, then on `/login` click **"💼 Try Demo (Business)"** to sign in as **DevCraft Technologies**.
- **Action:** Go to **"Manage Listings"** (`/business/manage`). Point to the applicant count on the *Full Stack Next.js Engineer* listing (**"1 application"**).
- **Action:** Click **"+ Post Opportunity"** (`/post-opportunity`).
- **What to Say:**
  > *"Now switching to the employer side. DevCraft Technologies immediately sees their open postings and live applicant counts. Notice our security policy: new business accounts default to unverified to eliminate fraudulent listings. Only verified businesses can publish. As a verified demo business, DevCraft can publish full-time jobs, internships, freelance gigs, or student fellowships across Indian cities with transparent INR compensation."*

---

### 3:45 – 4:30 | Top-of-Funnel: Public Learning Hub & Community

- **Action:** Click **"Sign Out"** to show logged-out state. Click **"Learning Hub"** (`/hub`).
- **What to Say:**
  > *"Customer acquisition in India requires strong top-of-funnel value. Anyone can access our Free Learning Hub without an account. It curates high-impact resources—like React documentation, Kaggle Python data science, and system design primers—filtered by difficulty from beginner to advanced."*
- **Action:** Click **"Community"** (`/community`). Show member discussion cards.
- **What to Say:**
  > *"We also provide a community feed where developers share milestone wins and ask career questions. Notice we've labeled secondary interactions like post likes and SMS login as 'Coming soon' to keep our core matching flow rock-solid for this demo."*

---

### 4:30 – 5:00 | What is Planned for Later (Roadmap)

- **What to Say:**
  > *"To scale this MVP post-demo, our immediate technical roadmap includes:
  > 1. Activating real-time SMS OTP delivery via Twilio / Fast2SMS for Indian phone numbers.
  > 2. Connecting the Razorpay test stub to live UPI and NetBanking payment webhooks for employer verification badges.
  > 3. Automated email notifications via Resend when employers move candidates from 'Pending' to 'Reviewed' or 'Accepted'.
  > 4. Full multilingual support using our completed Hindi translations dictionary.
  >
  > The core architecture is completely type-safe with Next.js 16 App Router and Supabase RLS, verified by 33 automated tests. Thank you—happy to take questions."*

---

## 📌 Summary Reference Table

| Step | Page | Key Takeaway |
| :--- | :--- | :--- |
| **1. Fast Login** | `/login` | 1-click demo buttons + sticky prototype banner |
| **2. Profile & AI** | `/profile` | Real-time completeness scoring + Claude AI summary |
| **3. Skill Match** | `/recommended` | Case-insensitive overlap ranking + skills to learn next |
| **4. Apply & Track** | `/my-applications` | Clean cover note workflow + status grouping |
| **5. Employer Side** | `/business/manage` | Live applicant counts + verified business RLS security |
| **6. Public Hub** | `/hub` | Zero-barrier acquisition tool for Indian tech students |

