"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logoutUser();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold">
          OpenForum
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/">Home</Link>

          {!loading && !user && (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}

          {!loading && user && (
            <>
              <Link href="/community/create">Create Community</Link>
              <Link href="/post/create">Create Post</Link>
              <Link href="/profile">Profile</Link>
              <button
                onClick={handleLogout}
                className="rounded bg-black px-3 py-1 text-white"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}