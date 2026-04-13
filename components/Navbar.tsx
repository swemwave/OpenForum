"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";

export default function Navbar() {
  const { user, loading, isModerator, authError } = useAuth();
  const router = useRouter();
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    try {
      setLogoutError("");
      await logoutUser();
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutError("Logout failed. Please try again.");
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
          <Link href="/community">Communities</Link>

          {authError ? (
            <span className="text-xs font-medium text-red-600">
              Profile unavailable
            </span>
          ) : null}

          {!loading && isModerator ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              Moderator
            </span>
          ) : null}

          {!loading && !user && (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}

          {!loading && user && (
            <>
              <Link href="/community/create">Create Community</Link>
              <Link href="/post/create">Write Post</Link>
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

      {logoutError ? (
        <div className="mx-auto max-w-6xl px-6 pb-3 text-sm text-red-600">
          {logoutError}
        </div>
      ) : null}
    </nav>
  );
}
