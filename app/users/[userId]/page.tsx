"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import CommunityCard from "@/components/CommunityCard";
import PostCard from "@/components/PostCard";
import { getPublicUserProfile } from "@/lib/firestore";
import {
  listCommentsByAuthor,
  listCommunitiesByCreator,
  listPostsByAuthor,
} from "@/lib/forum";
import type {
  Community,
  ForumComment,
  ForumPost,
  PublicUserProfile,
} from "@/lib/types";
import { formatDateTime, getErrorMessage } from "@/lib/utils";

function getOldestCreatedAt(
  communities: Community[],
  posts: ForumPost[],
  comments: ForumComment[]
) {
  const timestamps = [...communities, ...posts, ...comments]
    .map((item) => new Date(item.createdAt).getTime())
    .filter((timestamp) => Number.isFinite(timestamp));

  return timestamps.length > 0
    ? new Date(Math.min(...timestamps)).toISOString()
    : "";
}

function createProfileFromActivity(
  userId: string,
  communities: Community[],
  posts: ForumPost[],
  comments: ForumComment[]
): PublicUserProfile | null {
  const username =
    posts[0]?.authorName || comments[0]?.authorName || communities[0]?.creatorName;

  if (!username) {
    return null;
  }

  return {
    id: userId,
    username,
    avatarUrl: "",
    role: "user",
    createdAt: getOldestCreatedAt(communities, posts, comments),
  };
}

export default function PublicUserProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const { user, profile: currentUserProfile, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (authLoading) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const isOwnProfile = user?.uid === userId && currentUserProfile;
        const publicProfile: PublicUserProfile | null = isOwnProfile
          ? {
              id: userId,
              username: currentUserProfile.username,
              avatarUrl: currentUserProfile.avatarUrl,
              role: currentUserProfile.role,
              createdAt: currentUserProfile.createdAt,
            }
          : await getPublicUserProfile(userId);

        const [communityData, postData, commentData] = await Promise.all([
          listCommunitiesByCreator(userId),
          listPostsByAuthor(userId),
          listCommentsByAuthor(userId),
        ]);
        const resolvedProfile =
          publicProfile ??
          createProfileFromActivity(userId, communityData, postData, commentData);

        if (!isMounted) {
          return;
        }

        setProfile(resolvedProfile);
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

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [authLoading, currentUserProfile, user, userId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
        Loading user profile...
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

  if (!profile) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
        This user profile could not be found.
      </div>
    );
  }

  const totalPoints = posts.reduce(
    (sum, post) => sum + post.upvoteCount - post.downvoteCount,
    0
  );

  return (
    <section className="space-y-8">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-2xl font-bold text-white">
              {profile.username.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.username}
                </h1>
                {profile.role === "moderator" ? (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                    Moderator
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Joined {profile.createdAt ? formatDateTime(profile.createdAt) : "recently"}
              </p>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-2xl font-semibold text-gray-900">{posts.length}</p>
              <p>{posts.length === 1 ? "post" : "posts"}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-2xl font-semibold text-gray-900">
                {communities.length}
              </p>
              <p>{communities.length === 1 ? "community" : "communities"}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-2xl font-semibold text-gray-900">
                {totalPoints}
              </p>
              <p>{totalPoints === 1 ? "point" : "points"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr,1.05fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              Communities Created
            </h2>
            <Link href="/community" className="text-sm font-medium text-gray-700">
              Browse all
            </Link>
          </div>

          {communities.length > 0 ? (
            <div className="space-y-4">
              {communities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
              This user has not created any communities yet.
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Posts</h2>
            <span className="text-sm text-gray-500">
              {posts.length} result{posts.length === 1 ? "" : "s"}
            </span>
          </div>

          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
              This user has not published any posts yet.
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
