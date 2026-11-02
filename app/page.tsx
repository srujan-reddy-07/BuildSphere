import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

const stats = [
  { value: '10,000+', label: 'Talents', icon: '👥' },
  { value: '500+', label: 'Opportunities', icon: '💼' },
  { value: '50+', label: 'Cities', icon: '🏙️' },
]

const features = [
  {
    icon: '🔍',
    title: 'Discover Opportunities',
    description:
      'Browse jobs, internships, freelance gigs, and projects from startups and enterprises across India.',
    badge: 'Explore',
    badgeVariant: 'primary' as const,
  },
  {
    icon: '🤝',
    title: 'Connect & Collaborate',
    description:
      'Build your network with talented professionals, founders, and mentors from every corner of India.',
    badge: 'Community',
    badgeVariant: 'success' as const,
  },
  {
    icon: '📚',
    title: 'Learning Hub',
    description:
      "Access curated resources, courses, and guides handpicked for India's fast-growing tech ecosystem.",
    badge: 'Learn',
    badgeVariant: 'default' as const,
  },
  {
    icon: '🚀',
    title: 'Build Your Profile',
    description:
      'Showcase your skills, portfolio, and availability so the right opportunities find you — not the other way.',
    badge: 'Profile',
    badgeVariant: 'warning' as const,
  },
]

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-emerald-50 py-20 sm:py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold mb-6">
            🇮🇳 Made for India
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            India&apos;s{' '}
            <span className="text-orange-500">Talent Network</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Connecting ambitious individuals with the opportunities they deserve —
            from Mumbai to Manipur, Kochi to Kargil.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/opportunities"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors shadow-md shadow-orange-200"
            >
              Explore Opportunities
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl border-2 border-gray-900 text-gray-900 font-semibold hover:bg-gray-900 hover:text-white transition-colors"
            >
              Join Free
            </Link>
          </div>
        </div>

        {/* Decorative blobs */}
        <div
          aria-hidden="true"
          className="absolute top-8 left-8 w-40 h-40 bg-orange-200 rounded-full opacity-20 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-8 right-8 w-56 h-56 bg-emerald-200 rounded-full opacity-20 blur-3xl pointer-events-none"
        />
      </section>

      {/* Stats */}
      <section aria-label="Platform statistics" className="py-14 px-4 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map(({ value, label, icon }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-gray-50"
            >
              <span className="text-3xl mb-2">{icon}</span>
              <span className="text-3xl font-extrabold text-orange-500">{value}</span>
              <span className="text-sm font-medium text-gray-600 mt-1">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white" aria-labelledby="features-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2
              id="features-heading"
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            >
              Everything you need to grow
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              BuildSphere is your all-in-one platform to find work, learn new skills,
              and build meaningful connections across India.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon, title, description, badge, badgeVariant }) => (
              <Card key={title} hover className="p-6 flex flex-col gap-3">
                <div className="text-3xl">{icon}</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                  <Badge variant={badgeVariant}>{badge}</Badge>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Personalised CTA / Sign-in prompt */}
      <section
        className="py-16 px-4 bg-gradient-to-r from-orange-500 to-orange-600"
        aria-labelledby="cta-heading"
      >
        <div className="max-w-3xl mx-auto text-center">
          {user ? (
            <>
              <h2 id="cta-heading" className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Welcome back 👋
              </h2>
              <p className="text-orange-100 mb-8">
                Pick up where you left off — view your recommendations and applications.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-xl bg-white text-orange-600 font-semibold hover:bg-orange-50 transition-colors"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/opportunities"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-xl border-2 border-white text-white font-semibold hover:bg-white hover:text-orange-600 transition-colors"
                >
                  Browse Opportunities
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 id="cta-heading" className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready to find your next opportunity?
              </h2>
              <p className="text-orange-100 mb-8">
                Join thousands of talented individuals already on BuildSphere.
                It&apos;s free, fast, and built for India.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-xl bg-white text-orange-600 font-semibold hover:bg-orange-50 transition-colors"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-xl border-2 border-white text-white font-semibold hover:bg-white hover:text-orange-600 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-white">
            Build<span className="text-orange-500">Sphere</span>
          </p>
          <p className="text-xs text-center">
            © {new Date().getFullYear()} BuildSphere. Made with ❤️ in India.
          </p>
          <nav className="flex gap-4 text-sm" aria-label="Footer navigation">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
