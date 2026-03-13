import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-8">
      <div className="rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-4xl font-bold">Welcome to OpenForum</h1>
        <p className="mb-6 text-lg text-gray-600">
          A simple community platform where users can join discussions, create
          posts, and connect through topic-based communities.
        </p>

        <div className="flex gap-4">
          <Link
            href="/register"
            className="rounded bg-black px-4 py-2 text-white"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded border px-4 py-2"
          >
            Login
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">Trending Communities</h2>
          <p className="text-gray-600">
            Community listings will be added in the next sprint.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">Recent Posts</h2>
          <p className="text-gray-600">
            Post feeds and comments will be added in the next sprint.
          </p>
        </div>
      </div>
    </section>
  );
}