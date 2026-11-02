import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "My Applications | BuildSphere",
  description: "Track the status of all your opportunity applications.",
};

type ApplicationStatus = "pending" | "reviewed" | "accepted" | "rejected";

interface Application {
  id: string;
  created_at: string;
  status: ApplicationStatus;
  note: string | null;
  opportunities: {
    id: string;
    title: string;
    businesses: { name: string } | null;
  } | null;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string }
> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  reviewed: { label: "Reviewed", color: "bg-blue-100 text-blue-700" },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
};

const STATUS_ORDER: ApplicationStatus[] = [
  "accepted",
  "reviewed",
  "pending",
  "rejected",
];

function ApplicationCard({ application }: { application: Application }) {
  const status = application.status as ApplicationStatus;
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    color: "bg-gray-100 text-gray-700",
  };
  const opp = application.opportunities;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          {opp ? (
            <>
              <h3 className="text-sm font-semibold text-gray-900">
                <Link
                  href={`/opportunities/${opp.id}`}
                  className="hover:text-orange-600 transition-colors"
                >
                  {opp.title}
                </Link>
              </h3>
              <p className="text-xs text-gray-500">{opp.businesses?.name || 'Partner Company'}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400 italic">
              Opportunity no longer available
            </p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            Applied {formatDate(application.created_at)}
          </p>
          {application.note && (
            <p className="mt-2 line-clamp-2 text-xs text-gray-600 bg-gray-50 rounded p-2 border border-gray-100">
              {application.note}
            </p>
          )}
        </div>
        <span
          className={`inline-flex h-fit shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.color}`}
        >
          {config.label}
        </span>
      </div>
    </div>
  );
}

export default async function MyApplicationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/my-applications");
  }

  const { data: applicationsRaw } = await supabase
    .from("applications")
    .select(
      `
      id,
      created_at,
      status,
      note,
      opportunities (
        id,
        title,
        businesses (
          name
        )
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const applications = (applicationsRaw ?? []) as Application[];

  // Group by status
  const grouped = STATUS_ORDER.reduce<Record<ApplicationStatus, Application[]>>(
    (acc, status) => {
      acc[status] = applications.filter((a) => a.status === status);
      return acc;
    },
    { accepted: [], reviewed: [], pending: [], rejected: [] }
  );

  const hasAny = applications.length > 0;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            My Applications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track the status of your submitted applications.
          </p>
        </div>
        <Link
          href="/opportunities"
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Explore Opportunities
        </Link>
      </div>

      {/* Summary pills */}
      {hasAny && (
        <div className="mb-8 flex flex-wrap gap-3">
          {STATUS_ORDER.map((status) => {
            const count = grouped[status].length;
            const config = STATUS_CONFIG[status];
            return (
              <div
                key={status}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.color}`}
              >
                <span>{config.label}</span>
                <span className="rounded-full bg-white/60 px-1.5">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!hasAny && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
          <p className="text-sm font-medium text-gray-600">
            You haven't applied to any opportunities yet.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Find roles that match your skills and start building your portfolio.
          </p>
          <Link
            href="/opportunities"
            className="mt-4 inline-block rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            Browse Opportunities
          </Link>
        </div>
      )}

      {/* Grouped sections */}
      {hasAny && (
        <div className="space-y-10">
          {STATUS_ORDER.map((status) => {
            const group = grouped[status];
            if (group.length === 0) return null;
            const config = STATUS_CONFIG[status];
            return (
              <section key={status} aria-label={`${config.label} applications`}>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${config.color}`}
                  >
                    {config.label}
                  </span>
                  <span>({group.length})</span>
                </h2>
                <div className="space-y-3">
                  {group.map((app) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
