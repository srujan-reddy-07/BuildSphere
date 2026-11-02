import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import OpportunitiesFilters from '@/components/opportunities/OpportunitiesFilters';
import type { Opportunity } from '@/types/database';

const PAGE_SIZE = 10;

interface PageProps {
  searchParams: Promise<{
    type?: string;
    location?: string;
    skills?: string;
    page?: string;
  }>;
}

interface OpportunityWithBusiness extends Opportunity {
  businesses: { name: string } | null;
}

export default async function OpportunitiesPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const currentPage = Math.max(1, Number(searchParams.page ?? '1'));
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('opportunities')
    .select('*, businesses(name)', { count: 'exact' })
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (searchParams.type && searchParams.type !== 'all') {
    query = query.eq('type', searchParams.type as any);
  }

  if (searchParams.location) {
    query = query.ilike('location', `%${searchParams.location}%`);
  }

  if (searchParams.skills) {
    const skillTokens = searchParams.skills.split(',').map((s) => s.trim()).filter(Boolean);
    if (skillTokens.length > 0) {
      query = query.overlaps('required_skills', skillTokens);
    }
  }

  const { data: opportunities, count } = await query.returns<OpportunityWithBusiness[]>();

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Explore Opportunities</h1>
        <p className="text-gray-500 text-sm mt-1">
          {count ?? 0} open opportunities matching your search across India
        </p>
      </div>

      {/* Filters */}
      <Suspense fallback={<div className="h-16 bg-gray-100 rounded-lg animate-pulse" />}>
        <OpportunitiesFilters />
      </Suspense>

      {/* Listing */}
      {!opportunities || opportunities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-dashed border-gray-200">
          <span className="text-5xl mb-4" aria-hidden="true">🎯</span>
          <h2 className="text-lg font-semibold text-gray-800">No opportunities found</h2>
          <p className="text-gray-500 text-sm mt-1 max-w-sm">
            Try adjusting your search criteria or clear your filters to see all available openings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              companyName={opp.businesses?.name ?? 'Partner Organization'}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Opportunities pagination" className="flex items-center justify-center gap-2 pt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const params = new URLSearchParams();
            if (searchParams.type) params.set('type', searchParams.type);
            if (searchParams.location) params.set('location', searchParams.location);
            if (searchParams.skills) params.set('skills', searchParams.skills);
            params.set('page', String(page));
            return (
              <a
                key={page}
                href={`/opportunities?${params.toString()}`}
                aria-current={page === currentPage ? 'page' : undefined}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {page}
              </a>
            );
          })}
        </nav>
      )}
    </div>
  );
}
