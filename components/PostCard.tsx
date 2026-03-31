"use client";

import Link from "next/link";
import type { ForumPost } from "@/lib/types";
import { formatDateTime, truncateText } from "@/lib/utils";

type PostCardProps = {
  post: ForumPost;
  showCommunity?: boolean;
};

export default function PostCard({
  post,
  showCommunity = true,
}: PostCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
        {showCommunity ? (
          <Link
            href={`/community/${post.communityId}`}
            className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700"
          >
            {post.communityName}
          </Link>
        ) : null}
        <span>By {post.authorName}</span>
        <span>{formatDateTime(post.createdAt)}</span>
      </div>

      <div className="mt-3 space-y-3">
        <Link
          href={`/post/${post.id}`}
          className="block text-2xl font-semibold text-gray-900 hover:underline"
        >
          {post.title}
        </Link>
        <p className="text-gray-600">{truncateText(post.content, 220)}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 text-sm text-gray-500">
        <span>
          {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
        </span>
        <Link href={`/post/${post.id}`} className="font-medium text-gray-900">
          Read discussion
        </Link>
      </div>
    </article>
  );
}
