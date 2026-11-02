import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import CloseOpportunityButton from "./CloseOpportunityButton";

export const metadata = {
  title: "Manage Opportunities | BuildSphere",
  description: "View and manage the opportunities your business has posted.",
};

type OpportunityStatus = "open" | "closed" | "draft";

interface Opportunity {
  id: string;
  title: string;
  type: string;
  status: OpportunityStatus;
  deadline: string | null;
  created_at: string;
  application_count: number;
}

const STATUS_CONFIG: Record<
  OpportunityStatus,
  { label: string; color: string }
> = {
  open: { label: "Open", color: "bg-green-100 text-green-700" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-600" },
  draft: { label: "Draft", color: "bg-yellow-100 text-yellow-700" },
};

export default async function ManageOpportunitiesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/business/manage");
  }

  // Check user is a business
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("id", user.id)
    .maybeSingle();

  if (!business) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <span className="text-4xl mb-3 block" aria-hidden="true">🏢</span>
          <h1 className="text-xl font-bold text-gray-900">Company Profile Required</h1>
          <p className="mt-2 text-sm text-gray-600">
            This console is reserved for employer accounts. You can create a company profile by posting your first opportunity or signing in with the demo business account.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/post-opportunity"
              className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              Post First Opportunity
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Fetch opportunities with application count
  const { data: opportunitiesRaw } = await supabase
    .from("opportunities")
    .select(
      `
      id,
      title,
      type,
      status,
      deadline,
      created_at,
      applications(count)
    `
    )
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  const opportunities: Opportunity[] = (opportunitiesRaw ?? []).map(
    (o: {
      id: string;
      title: string;
      type: string;
      status: string;
      deadline: string | null;
      created_at: string;
      applications: { count: number }[];
    }) => ({
      id: o.id,
      title: o.title,
      type: o.type,
      status: o.status as OpportunityStatus,
      deadline: o.deadline,
      created_at: o.created_at,
      application_count: o.applications?.[0]?.count ?? 0,
    })
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Manage Opportunities
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {business.name} · {opportunities.length} posting
            {opportunities.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/post-opportunity"
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
        >
          <span aria-hidden="true">＋</span>
          Post New Opportunity
        </Link>
      </div>

      {/* Empty state */}
      {opportunities.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
          <p className="text-sm font-medium text-gray-600">
            You haven't posted any opportunities yet.
          </p>
          <Link
            href="/post-opportunity"
            className="mt-4 inline-block rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            Post Your First Opportunity
          </Link>
        </div>
      )}

      {/* Opportunities list */}
      {opportunities.length > 0 && (
        <div className="space-y-4">
          {opportunities.map((opp) => {
            const config = STATUS_CONFIG[opp.status] ?? {
              label: opp.status,
              color: "bg-gray-100 text-gray-600",
            };
            const isOpen = opp.status === "open";

            return (
              <div
                key={opp.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Info */}
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.color}`}
                      >
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">
                        {opp.type}
                      </span>
                    </div>
                    <h2 className="text-base font-semibold text-gray-900">
                      {opp.title}
                    </h2>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>
                        Posted {formatDate(opp.created_at)}
                      </span>
                      {opp.deadline && (
                        <span>Deadline: {formatDate(opp.deadline)}</span>
                      )}
                      <span className="font-medium text-gray-700">
                        {opp.application_count} application
                        {opp.application_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/business/manage/${opp.id}/edit`}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </Link>
                    {isOpen && (
                      <CloseOpportunityButton opportunityId={opp.id} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
