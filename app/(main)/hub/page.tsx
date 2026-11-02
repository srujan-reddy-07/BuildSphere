import { createClient } from '@/lib/supabase/server';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import type { Resource } from '@/types/database';

interface PageProps {
  searchParams: Promise<{ category?: string; difficulty?: string }>;
}

const DIFFICULTY_VARIANTS: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
};

const CATEGORIES = ['All', 'Web Development', 'Data Science', 'UI/UX Design', 'System Design', 'Marketing'];

export default async function LearningHubPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const selectedCategory = searchParams.category || 'All';
  const selectedDifficulty = searchParams.difficulty || 'All';

  let query = supabase.from('resources').select('*').order('created_at', { ascending: false });

  if (selectedCategory !== 'All') {
    query = query.ilike('category', `%${selectedCategory}%`);
  }

  if (selectedDifficulty !== 'All') {
    query = query.eq('difficulty', selectedDifficulty.toLowerCase() as any);
  }

  const { data: resources } = await query;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 sm:p-10 text-white shadow-md">
        <div className="max-w-2xl">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm mb-3">
            ✨ 100% Free Resources
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            India Talent Learning Hub
          </h1>
          <p className="mt-2 text-white/90 text-sm sm:text-base leading-relaxed">
            Curated, high-impact tutorials, courses, and guides to help Indian students, freshers, and professionals upskill in tech, design, and growth. No sign-in required.
          </p>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-2 overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <a
              key={cat}
              href={cat === 'All' ? '/hub' : `/hub?category=${encodeURIComponent(cat)}`}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </a>
          );
        })}
      </div>

      {/* Resource Cards */}
      {!resources || resources.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200 p-8">
          <span className="text-4xl mb-3 block" aria-hidden="true">📚</span>
          <h2 className="text-lg font-bold text-gray-800">No resources found</h2>
          <p className="text-sm text-gray-500 mt-1">Try selecting a different category or check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res: Resource) => (
            <Card key={res.id} hover className="p-6 flex flex-col justify-between h-full border border-gray-100">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="default" className="text-xs font-semibold bg-orange-50 text-orange-700 border-none">
                    {res.category}
                  </Badge>
                  <Badge variant={DIFFICULTY_VARIANTS[res.difficulty] ?? 'default'} className="capitalize text-xs">
                    {res.difficulty}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug">
                  {res.title}
                </h3>

                {res.description && (
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {res.description}
                  </p>
                )}
              </div>

              <div className="pt-5 mt-4 border-t border-gray-100">
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 px-4 py-2 text-xs font-bold transition-colors"
                >
                  Start Learning ↗
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
