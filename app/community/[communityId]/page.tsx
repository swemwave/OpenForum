"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import PostCard from "@/components/PostCard";
import { createPost, getCommunity, listPostsByCommunity } from "@/lib/forum";
import { POST_CONTENT_MAX_LENGTH, POST_TITLE_MAX_LENGTH } from "@/lib/limits";
import type { Community, ForumPost } from "@/lib/types";
import { formatDateTime, getErrorMessage, getUserIdentity } from "@/lib/utils";

export default function CommunityDetailPage() {
  const params = useParams<{ communityId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const communityId = params.communityId;
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [postError, setPostError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCommunityPage() {
      try {
        setLoading(true);
        const [communityData, postData] = await Promise.all([
          getCommunity(communityId),
          listPostsByCommunity(communityId),
        ]);

        if (!isMounted) {
          return;
        }

        setCommunity(communityData);
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

    void loadCommunityPage();

    return () => {
      isMounted = false;
    };
  }, [communityId]);

  async function handleCreatePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPostError("");

    const identity = getUserIdentity(user);

    if (!identity) {
      setPostError("You need to be logged in to create a post.");
      return;
    }

    try {
      setSubmitting(true);
      const postId = await createPost(
        {
          communityId,
          title,
          content,
        },
        identity
      );

      router.push(`/post/${postId}`);
    } catch (submitError) {
      setPostError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
        Loading community...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!community) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
        This community could not be found.
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Link href="/community" className="text-sm font-medium text-gray-500">
              Back to communities
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">{community.name}</h1>
            <p className="max-w-3xl text-lg text-gray-600">
              {community.description}
            </p>
          </div>

          <div className="rounded-xl bg-gray-100 px-5 py-4 text-sm text-gray-700">
            <p>
              Created by{" "}
              <Link
                href={`/users/${community.creatorId}`}
                className="font-medium text-gray-900 underline"
              >
                {community.creatorName}
              </Link>
            </p>
            <p className="mt-1">{formatDateTime(community.createdAt)}</p>
            <p className="mt-1">
              {posts.length} live post{posts.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>

      {user ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">
              Start a post in this community
            </h2>
            <p className="text-gray-600">
              Posts created here are automatically linked to this community.
            </p>
          </div>

          <form onSubmit={handleCreatePost} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="What do you want to discuss?"
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
                maxLength={POST_TITLE_MAX_LENGTH}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <textarea
                rows={6}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Share the context, question, or idea."
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
                maxLength={POST_CONTENT_MAX_LENGTH}
                required
              />
            </div>

            {postError ? <p className="text-sm text-red-600">{postError}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
            >
              {submitting ? "Publishing..." : "Publish post"}
            </button>
          </form>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
          <Link href="/login" className="font-medium text-gray-900 underline">
            Log in
          </Link>{" "}
          to create a post in this community.
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Posts</h2>
          <span className="text-sm text-gray-500">
            {posts.length} result{posts.length === 1 ? "" : "s"}
          </span>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} showCommunity={false} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
            No posts yet. Be the first person to post in this community.
          </div>
        )}
      </div>
    </section>
  );
}
