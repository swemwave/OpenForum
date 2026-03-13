"use client";

import ProtectedPage from "@/components/ProtectedPage";

export default function CreatePostPage() {
  return (
    <ProtectedPage>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold">Create Post</h1>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Post Title"
            className="w-full rounded border px-3 py-2"
          />
          <textarea
            placeholder="Post Content"
            className="w-full rounded border px-3 py-2"
            rows={6}
          />
          <button
            type="submit"
            className="rounded bg-black px-4 py-2 text-white"
          >
            Create Post
          </button>
        </form>
      </div>
    </ProtectedPage>
  );
}