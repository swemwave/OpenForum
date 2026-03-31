"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import CommunityCard from "@/components/CommunityCard";
import { listCommunities } from "@/lib/forum";
import type { Community } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";

export default function CreatePostPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCommunities() {
      try {
        setLoading(true);
        const communityData = await listCommunities();

        if (!isMounted) {
          return;
        }

        setCommunities(communityData);
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

    void loadCommunities();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCommunities = communities.filter((community) =>
    [community.name, community.description, community.creatorName]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase())
  );

  return (
    <ProtectedPage>
      <div className="space-y-6">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
              Create a post
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              Choose a community first
            </h1>
            <p className="text-gray-600">
              Posts are created inside communities so every discussion belongs to
              a clear topic.
            </p>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              Find a community
            </label>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search communities"
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
            Loading communities...
          </div>
        ) : filteredCommunities.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                actionLabel="Write post"
                actionHref={`/community/${community.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
            No communities matched your search.
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
