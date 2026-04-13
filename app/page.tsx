"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import CommunityCard from "@/components/CommunityCard";
import PostCard from "@/components/PostCard";
import { listCommunities, listPosts } from "@/lib/forum";
import type { Community, ForumPost } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";

export default function HomePage() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadForumData() {
      try {
        setLoading(true);
        const [communityData, postData] = await Promise.all([
          listCommunities(),
          listPosts(),
        ]);

        if (!isMounted) {
          return;
        }

        setCommunities(communityData);
        setPosts(postData);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(getErrorMessage(loadError));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadForumData();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasSearchQuery = normalizedQuery.length > 0;
  const filteredCommunities = communities.filter((community) => {
    if (!normalizedQuery) {
      return true;
    }

    return [community.name, community.description, community.creatorName]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });
  const filteredPosts = posts.filter((post) => {
    if (!normalizedQuery) {
      return true;
    }

    return [post.title, post.content, post.communityName, post.authorName]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  return (
    <section className="space-y-8">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
              Community forum
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Create communities, publish posts, and grow threaded discussions.
            </h1>
            <p className="text-lg text-gray-600">
              Search communities and posts from one place, then jump into the
              discussion.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={user ? "/community/create" : "/register"}
              className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
            >
              {user ? "Create community" : "Create an account"}
            </Link>
            <Link
              href={user ? "/post/create" : "/login"}
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700"
            >
              {user ? "Write a post" : "Log in"}
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <label className="block text-sm font-medium text-gray-700">
            Search posts and communities
          </label>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by title, content, community name, or author"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
          Loading communities and posts...
        </div>
      ) : (
        <div className="grid gap-8 xl:grid-cols-[1.05fr,1fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">
                Communities
              </h2>
              <Link href="/community" className="text-sm font-medium text-gray-700">
                View all
              </Link>
            </div>

            {filteredCommunities.length > 0 ? (
              <div className="space-y-4">
                {filteredCommunities.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
                {hasSearchQuery
                  ? "No communities matched your search."
                  : "No communities yet. Create the first one to get the forum moving."}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Recent Posts</h2>
              <span className="text-sm text-gray-500">
                {filteredPosts.length} result{filteredPosts.length === 1 ? "" : "s"}
              </span>
            </div>

            {filteredPosts.length > 0 ? (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
                {hasSearchQuery
                  ? "No posts matched your search."
                  : "No posts yet. Start a discussion from any community page."}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
