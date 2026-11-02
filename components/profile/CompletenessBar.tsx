"use client";

import Link from "next/link";

interface CompletenessBarProps {
  score: number;
  missing: string[];
}

const MISSING_LINKS: Record<string, string> = {
  "Profile photo": "/profile#photo",
  "Full name": "/profile#name",
  Bio: "/profile#bio",
  Skills: "/profile#skills",
  Location: "/profile#location",
  "Social links": "/profile#social",
  Portfolio: "/profile#portfolio",
  Resume: "/profile#resume",
};

function getBarColor(score: number): string {
  if (score < 40) return "bg-red-500";
  if (score < 70) return "bg-yellow-400";
  return "bg-green-500";
}

function getMotivationalText(score: number): string {
  if (score < 40) return "Great start!";
  if (score < 70) return "Almost there!";
  return "Profile complete!";
}

function getTextColor(score: number): string {
  if (score < 40) return "text-red-600";
  if (score < 70) return "text-yellow-600";
  return "text-green-600";
}

export default function CompletenessBar({ score, missing }: CompletenessBarProps) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const barColor = getBarColor(clampedScore);
  const textColor = getTextColor(clampedScore);
  const motivationalText = getMotivationalText(clampedScore);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header row */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">
          Profile Completeness
        </span>
        <span className={`text-sm font-bold ${textColor}`}>
          {clampedScore}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-gray-100"
        role="progressbar"
        aria-valuenow={clampedScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Profile completeness: ${clampedScore}%`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${clampedScore}%` }}
        />
      </div>

      {/* Motivational text */}
      <p className={`mt-2 text-xs font-medium ${textColor}`}>
        {motivationalText}
        {clampedScore < 100 && " Keep going to unlock more opportunities."}
      </p>

      {/* Missing items */}
      {missing.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Complete these sections:
          </p>
          <ul className="flex flex-wrap gap-2">
            {missing.map((item) => {
              const href = MISSING_LINKS[item] ?? "/profile";
              return (
                <li key={item}>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <span aria-hidden="true">＋</span>
                    {item}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
