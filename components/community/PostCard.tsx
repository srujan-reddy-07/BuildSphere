"use client";

import { useState } from "react";
import { formatRelativeTime } from "@/lib/utils";

interface PostCardProps {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  likesCount: number;
  currentUserId: string | null;
  authorId: string;
}

const AVATAR_COLORS = [
  "bg-indigo-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-red-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 transition-colors ${filled ? "text-red-500" : "text-gray-400"}`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

const TRUNCATE_LIMIT = 200;

export default function PostCard({
  id,
  content,
  authorName,
  createdAt,
  likesCount,
  currentUserId,
  authorId,
}: PostCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isOwnPost = currentUserId === authorId;
  const initials = authorName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const avatarColor = getAvatarColor(authorName);
  const isTruncatable = content.length > TRUNCATE_LIMIT;
  const displayedContent =
    isTruncatable && !expanded ? content.slice(0, TRUNCATE_LIMIT) + "…" : content;

  return (
    <article id={`post-${id}`} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Author row */}
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColor}`}
          aria-hidden="true"
        >
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{authorName}</p>
          <time
            className="text-xs text-gray-400"
            dateTime={createdAt}
            title={new Date(createdAt).toLocaleString()}
          >
            {formatRelativeTime(createdAt)}
          </time>
        </div>
      </div>

      {/* Content */}
      <div className="mt-3">
        <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
          {displayedContent}
        </p>
        {isTruncatable && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-xs font-medium text-indigo-600 hover:underline"
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-3">
        <button
          disabled
          title="Likes coming soon in next release"
          aria-label={`Likes coming soon — ${likesCount} likes`}
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed"
        >
          <HeartIcon filled={false} />
          <span>{likesCount}</span>
          <span className="text-[10px] text-gray-400 font-normal ml-0.5">(Coming soon)</span>
        </button>
        {isOwnPost && (
          <span className="text-xs text-gray-400 italic">Your post</span>
        )}
      </div>
    </article>
  );
}
