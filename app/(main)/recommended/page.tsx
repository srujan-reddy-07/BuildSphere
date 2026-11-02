import { createClient } from "@/lib/supabase/server";
import { rankOpportunities, suggestSkills } from "@/lib/matching";
import { redirect } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "Recommended for You | BuildSphere",
  description: "Opportunities ranked by skill match for your profile.",
};

const TYPE_LABELS: Record<string, string> = {
  job: "Full-Time Job",
  internship: "Internship",
  freelance: "Freelance Contract",
  project: "Real-World Project",
};

export default async function RecommendedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/recommended");
  }

  // Fetch user skills
  const { data: userSkillRows } = await supabase
    .from("user_skills")
    .select("skills(name)")
    .eq("user_id", user.id);

  const userSkills: string[] = (userSkillRows ?? [])
    .flatMap((row: any) => (row.skills?.name ? [row.skills.name] : []));

  // Fetch all open opportunities
  const { data: opportunitiesRaw } = await supabase
    .from("opportunities")
    .select("id, title, type, location, is_remote, required_skills, description, deadline, businesses(name)")
    .eq("status", "open");

  const opportunities = (opportunitiesRaw ?? []).map((opp: any) => ({
    id: opp.id,
    title: opp.title,
    business: opp.businesses ? { name: opp.businesses.name } : null,
    type: opp.type,
    location: opp.is_remote ? "Remote" : opp.location,
    required_skills: opp.required_skills ?? [],
  }));

  const ranked = rankOpportunities(opportunities, userSkills);
  const suggested = suggestSkills(opportunities, userSkills, 6);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
          Personalized Matching
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
          Recommended Opportunities
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Ranked automatically based on your skills profile ({userSkills.length} skills listed).
        </p>
      </div>

      {/* User skill prompt if empty */}
      {userSkills.length === 0 ? (
        <Card className="p-8 text-center bg-orange-50/50 border border-orange-200">
          <span className="text-4xl mb-3 block" aria-hidden="true">💡</span>
          <h2 className="text-lg font-bold text-gray-900">Add skills to get tailored recommendations</h2>
          <p className="text-sm text-gray-600 mt-1 max-w-md mx-auto">
            You haven't listed any skills on your profile yet. Add your technologies, frameworks, and tools to see real match scores.
          </p>
          <div className="mt-4">
            <Link href="/profile">
              <Button>Update My Profile Skills</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Your Active Skills:</span>
          {userSkills.map((s) => (
            <Badge key={s} variant="primary" className="text-xs">
              {s}
            </Badge>
          ))}
          <Link href="/profile" className="text-xs text-orange-600 hover:underline font-medium ml-2">
            Edit skills ↗
          </Link>
        </div>
      )}

      {/* In-Demand Skills to Learn Next */}
      {suggested.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
          <h2 className="text-base font-bold text-gray-900">
            🔥 Skills to Learn Next (High Demand in India)
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            These skills appear frequently across open postings on BuildSphere and could significantly increase your match rate:
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {suggested.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-orange-200 text-orange-800 text-xs font-semibold shadow-2xs"
              >
                + {skill}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Opportunity Matches */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">
          Matched Opportunities ({ranked.length})
        </h2>

        {ranked.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm">No open opportunities at this moment.</p>
          </div>
        ) : (
          ranked.map((opp, index) => {
            const isHighMatch = opp.matchScore >= 70;
            const isMidMatch = opp.matchScore >= 40 && opp.matchScore < 70;

            return (
              <Card
                key={opp.opportunityId}
                hover
                className="p-5 border border-gray-100 transition-all hover:border-orange-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-400 font-bold">#{index + 1}</span>
                      <Badge variant="default" className="text-xs capitalize">
                        {TYPE_LABELS[opp.type] ?? opp.type}
                      </Badge>
                      <span className="text-xs text-gray-500 font-medium">📍 {opp.location}</span>
                    </div>

                    <Link href={`/opportunities/${opp.opportunityId}`} className="block group">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {opp.title}
                      </h3>
                    </Link>

                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {opp.company}
                    </p>

                    {/* Skill Breakdown */}
                    <div className="pt-2 space-y-1.5">
                      {opp.matchedSkills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 text-xs">
                          <span className="text-emerald-700 font-semibold mr-1">✓ Matched:</span>
                          {opp.matchedSkills.map((m) => (
                            <span
                              key={m}
                              className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-xs"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      )}

                      {opp.missingSkills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 text-xs">
                          <span className="text-gray-500 font-medium mr-1">Missing:</span>
                          {opp.missingSkills.map((m) => (
                            <span
                              key={m}
                              className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Match Score & CTA */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
                        isHighMatch
                          ? "bg-emerald-100 text-emerald-800"
                          : isMidMatch
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {opp.matchScore}% Match
                    </div>

                    <Link href={`/opportunities/${opp.opportunityId}/apply`}>
                      <Button size="sm" className="text-xs">
                        Apply Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
