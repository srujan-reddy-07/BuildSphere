import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getProfileCompleteness } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CompletenessBar from '@/components/profile/CompletenessBar';
import type { Profile } from '@/types/database';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/dashboard');
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<Profile>();

  // Fetch skills
  const { data: userSkillRows } = await supabase
    .from('user_skills')
    .select('skills(name)')
    .eq('user_id', user.id);

  const skills = (userSkillRows ?? []).flatMap((row: any) =>
    row.skills?.name ? [row.skills.name] : []
  );

  // Fetch applications count
  const { count: applicationCount } = await supabase
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Fetch open opportunities count
  const { count: oppCount } = await supabase
    .from('opportunities')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'open');

  // Check if user is associated with a business
  const { data: userBusiness } = await supabase
    .from('businesses')
    .select('id, name, verified')
    .eq('id', user.id)
    .maybeSingle();

  const { score: completenessScore, missing: missingFields } = getProfileCompleteness(
    profile || {},
    skills
  );

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Member';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Welcome back, {displayName} 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Here is what is happening across your opportunities and career network.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/profile">
            <Button variant="secondary" size="sm">Edit Profile</Button>
          </Link>
          <Link href="/opportunities">
            <Button size="sm">Browse Opportunities</Button>
          </Link>
        </div>
      </div>

      {/* Profile Completeness Bar */}
      <CompletenessBar score={completenessScore} missing={missingFields} />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/my-applications">
          <Card hover className="p-5 border border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              My Applications
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-orange-600">
                {applicationCount ?? 0}
              </span>
              <span className="text-xs text-orange-600 font-medium hover:underline">
                View status →
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Jobs, internships & freelance gigs applied</p>
          </Card>
        </Link>

        <Link href="/recommended">
          <Card hover className="p-5 border border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Skill Matches
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-emerald-600">
                {skills.length}
              </span>
              <span className="text-xs text-emerald-600 font-medium hover:underline">
                View matches →
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Skills currently tracked on your profile</p>
          </Card>
        </Link>

        <Link href="/opportunities">
          <Card hover className="p-5 border border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Listings
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-blue-600">
                {oppCount ?? 0}
              </span>
              <span className="text-xs text-blue-600 font-medium hover:underline">
                Explore all →
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Open opportunities across India</p>
          </Card>
        </Link>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userBusiness ? (
          <Card className="p-6 space-y-3 border-orange-200 bg-orange-50/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">🏢</span>
                <div>
                  <h2 className="font-bold text-gray-900 text-base">Employer Console</h2>
                  <p className="text-xs text-gray-500">
                    {userBusiness.name} {userBusiness.verified ? '• Verified' : '• Verification Pending'}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${userBusiness.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {userBusiness.verified ? 'Verified' : 'Pending'}
              </span>
            </div>
            <div className="flex gap-2 pt-2">
              <Link href="/business/manage" className="flex-1">
                <Button size="sm" className="w-full text-xs">
                  Manage Listings & Applicants
                </Button>
              </Link>
              <Link href="/post-opportunity" className="flex-1">
                <Button size="sm" variant="secondary" className="w-full text-xs">
                  + Post Opening
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">🚀</span>
              <div>
                <h2 className="font-bold text-gray-900 text-base">Recommended For You</h2>
                <p className="text-xs text-gray-500">
                  Opportunities ranked automatically by skill overlap with your profile.
                </p>
              </div>
            </div>
            <Link href="/recommended" className="block pt-2">
              <Button variant="secondary" className="w-full text-xs">
                View My Skill Recommendations
              </Button>
            </Link>
          </Card>
        )}

        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">📚</span>
            <div>
              <h2 className="font-bold text-gray-900 text-base">Free Learning Hub</h2>
              <p className="text-xs text-gray-500">
                Sharpen your tech, design, and growth skills with curated free resources.
              </p>
            </div>
          </div>
          <Link href="/hub" className="block pt-2">
            <Button variant="secondary" className="w-full text-xs">
              Explore Learning Hub
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
