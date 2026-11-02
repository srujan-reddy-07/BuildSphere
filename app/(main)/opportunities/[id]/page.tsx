import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import type { Opportunity, Business } from '@/types/database';

interface PageProps {
  params: Promise<{ id: string }>;
}

const TYPE_LABELS: Record<string, string> = {
  job: 'Full-Time Job',
  internship: 'Internship',
  freelance: 'Freelance Project',
  project: 'Real-World Project',
};

const STATUS_VARIANTS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  reviewed: 'primary',
  accepted: 'success',
  rejected: 'danger',
};

export default async function OpportunityDetailPage(props: PageProps) {
  const params = await props.params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch opportunity with business details
  const { data: oppData } = await supabase
    .from('opportunities')
    .select('*, businesses(*)')
    .eq('id', params.id)
    .single();

  if (!oppData) {
    notFound();
  }

  const opp = oppData as Opportunity & { businesses: Business | null };

  // Check if current user has applied
  let existingApplication = null;
  if (user) {
    const { data: appData } = await supabase
      .from('applications')
      .select('*')
      .eq('opportunity_id', params.id)
      .eq('user_id', user.id)
      .maybeSingle();
    existingApplication = appData;
  }

  const isExpired = opp.deadline && new Date(opp.deadline) < new Date();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link href="/opportunities" className="hover:text-orange-600 transition-colors">
          Opportunities
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-xs">{opp.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">{TYPE_LABELS[opp.type] ?? opp.type}</Badge>
              {opp.is_remote ? (
                <Badge variant="success">🌐 Remote</Badge>
              ) : (
                <Badge variant="default">📍 {opp.location || 'India'}</Badge>
              )}
              {opp.status === 'closed' && <Badge variant="danger">Closed</Badge>}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              {opp.title}
            </h1>

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">
                {opp.businesses?.name ?? 'Partner Business'}
              </span>
              {opp.businesses?.website && (
                <a
                  href={opp.businesses.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline text-xs"
                >
                  Visit Website ↗
                </a>
              )}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">About the Opportunity</h2>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed text-sm sm:text-base">
                {opp.description}
              </div>
            </div>

            {opp.required_skills && opp.required_skills.length > 0 && (
              <div className="border-t border-gray-100 pt-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {opp.required_skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <h3 className="font-bold text-gray-900 text-base">Overview</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Stipend / Salary</span>
                <span className="font-semibold text-gray-900">
                  {opp.stipend_min || opp.stipend_max
                    ? `₹${opp.stipend_min?.toLocaleString('en-IN') ?? 0}${
                        opp.stipend_max ? ` - ₹${opp.stipend_max.toLocaleString('en-IN')}` : '+'
                      }`
                    : 'Unpaid / Experience'}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Application Deadline</span>
                <span className={`font-semibold ${isExpired ? 'text-red-500' : 'text-gray-900'}`}>
                  {opp.deadline ? formatDate(opp.deadline) : 'Rolling basis'}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Location</span>
                <span className="font-semibold text-gray-900">
                  {opp.is_remote ? 'Remote (India-wide)' : opp.location || 'India'}
                </span>
              </div>
            </div>

            {/* Application State CTA */}
            <div className="pt-2">
              {existingApplication ? (
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-center space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-orange-700">
                    Application Status
                  </span>
                  <div>
                    <Badge variant={STATUS_VARIANTS[existingApplication.status] ?? 'default'}>
                      {existingApplication.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Submitted on {formatDate(existingApplication.created_at)}
                  </p>
                </div>
              ) : isExpired ? (
                <Button disabled className="w-full bg-gray-200 text-gray-500 cursor-not-allowed">
                  Application Closed
                </Button>
              ) : user ? (
                <Link href={`/opportunities/${opp.id}/apply`} className="block">
                  <Button className="w-full">Apply Now</Button>
                </Link>
              ) : (
                <Link href={`/login?redirect=/opportunities/${opp.id}/apply`} className="block">
                  <Button className="w-full">Sign In to Apply</Button>
                </Link>
              )}
            </div>
          </Card>

          {/* Company Card */}
          {opp.businesses && (
            <Card className="p-6 space-y-3">
              <h4 className="font-bold text-gray-900 text-sm">About {opp.businesses.name}</h4>
              {opp.businesses.description && (
                <p className="text-xs text-gray-600 leading-relaxed">
                  {opp.businesses.description}
                </p>
              )}
              {opp.businesses.verified && (
                <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ Verified Business
                </span>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
