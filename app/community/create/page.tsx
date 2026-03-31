"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/components/AuthProvider";
import { createCommunity } from "@/lib/forum";
import { getErrorMessage, getUserIdentity } from "@/lib/utils";

export default function CreateCommunityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const identity = getUserIdentity(user);

    if (!identity) {
      setError("You need to be logged in to create a community.");
      return;
    }

    try {
      setLoading(true);
      const communityId = await createCommunity(
        {
          name,
          description,
        },
        identity
      );

      router.push(`/community/${communityId}`);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedPage>
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            New community
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Create a community</h1>
          <p className="text-gray-600">
            Give your topic a clear name and a description so people know what
            belongs there.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Community name
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Frontend Patterns"
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what people should post, ask, and discuss here."
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
          >
            {loading ? "Creating..." : "Create community"}
          </button>
        </form>
      </div>
    </ProtectedPage>
  );
}
