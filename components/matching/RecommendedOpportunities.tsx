"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { rankOpportunities, type SkillMatch } from "@/lib/matching";

interface RecommendedOpportunitiesProps {
  userId: string;
  userSkills: string[];
}

const TYPE_COLORS: Record<string, string> = {
  internship: "bg-purple-100 text-purple-700",
  job: "bg-blue-100 text-blue-700",
  freelance: "bg-orange-100 text-orange-700",
  project: "bg-emerald-100 text-emerald-700",
};

function SkeletonCard() {
  return (
    <div className="min-w-[260px] max-w-[260px] shrink-0 animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:min-w-0 sm:max-w-none">
      <div className="mb-3 h-4 w-3/4 rounded bg-gray-200" />
      <div className="mb-2 h-3 w-1/2 rounded bg-gray-200" />
      <div className="h-3 w-1/3 rounded bg-gray-200" />
    </div>
  );
}

export default function RecommendedOpportunities({
  userId,
  userSkills,
}: RecommendedOpportunitiesProps) {
  const supabase = createClient();
  const [ranked, setRanked] = useState<SkillMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userSkills.length) {
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("opportunities")
        .select("id, title, type, location, is_remote, required_skills, description, businesses(name)")
        .eq("status", "open");

      if (fetchError) {
        setError("Failed to load recommendations.");
        setLoading(false);
        return;
      }

      const formatted = (data ?? []).map((opp: any) => ({
        id: opp.id,
        title: opp.title,
        business: opp.businesses ? { name: opp.businesses.name } : null,
        type: opp.type,
        location: opp.is_remote ? "Remote" : opp.location,
        required_skills: opp.required_skills ?? [],
      }));

      const results = rankOpportunities(formatted, userSkills).slice(0, 5);
      setRanked(results);
      setLoading(false);
    }

    load();
  }, [userId, userSkills, supabase]);

  if (!userSkills.length) {
    return (
      <section aria-label="Recommended Opportunities">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recommended for You
          </h2>
        </div>
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
          <p className="text-sm text-gray-500">
            Add skills to your profile to see personalized recommendations.
          </p>
          <Link
            href="/profile"
            className="mt-3 inline-block rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            Add Skills
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Recommended Opportunities">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Recommended for You
        </h2>
        <Link
          href="/recommended"
          className="text-sm font-medium text-orange-600 hover:underline"
        >
          See all →
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      {/* Horizontal scroll on mobile, grid on larger */}
      <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : ranked.map((opp) => {
              const typeColor =
                TYPE_COLORS[opp.type?.toLowerCase()] ??
                "bg-gray-100 text-gray-700";

              return (
                <Link
                  key={opp.opportunityId}
                  href={`/opportunities/${opp.opportunityId}`}
                  className="group min-w-[260px] shrink-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md hover:border-orange-200 sm:min-w-0"
                >
                  {/* Match badge */}
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${typeColor}`}
                    >
                      {opp.type ?? "Opportunity"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                      {opp.matchScore}% match
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {opp.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">{opp.company}</p>

                  {opp.matchedSkills.length > 0 && (
                    <p className="mt-2 text-xs text-emerald-700 font-medium">
                      ✓ {opp.matchedSkills.length} of {opp.requiredSkills.length} skills matched
                    </p>
                  )}
                </Link>
              );
            })}
      </div>

      {!loading && ranked.length === 0 && !error && (
        <p className="text-sm text-gray-500">
          No open opportunities found right now. Check back soon!
        </p>
      )}
    </section>
  );
}
