"use client";

import Link from "next/link";
import type { Community } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

type CommunityCardProps = {
  community: Community;
  actionLabel?: string;
  actionHref?: string;
};

export default function CommunityCard({
  community,
  actionLabel,
  actionHref,
}: CommunityCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href={`/community/${community.id}`}
            className="text-xl font-semibold text-gray-900 hover:underline"
          >
            {community.name}
          </Link>
          <p className="text-sm text-gray-600">{community.description}</p>
        </div>

        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          {community.postCount} {community.postCount === 1 ? "post" : "posts"}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 text-sm text-gray-500">
        <p>Created by {community.creatorName}</p>
        <p>{formatDateTime(community.createdAt)}</p>
      </div>

      {actionLabel && actionHref ? (
        <div className="mt-4">
          <Link
            href={actionHref}
            className="inline-flex rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </article>
  );
}
