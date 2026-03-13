"use client";

import ProtectedPage from "@/components/ProtectedPage";

export default function CreateCommunityPage() {
  return (
    <ProtectedPage>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold">Create Community</h1>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Community Name"
            className="w-full rounded border px-3 py-2"
          />
          <textarea
            placeholder="Community Description"
            className="w-full rounded border px-3 py-2"
            rows={4}
          />
          <button
            type="submit"
            className="rounded bg-black px-4 py-2 text-white"
          >
            Create Community
          </button>
        </form>
      </div>
    </ProtectedPage>
  );
}