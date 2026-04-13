"use client";

import Link from "next/link";
import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/components/AuthProvider";
import { formatDateTime } from "@/lib/utils";

export default function ProfilePage() {
  const { user, profile, isModerator } = useAuth();

  return (
    <ProtectedPage>
      <div className="space-y-6">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-2xl font-bold text-white">
                {(user?.displayName || user?.email || "O").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
                  Your profile
                </p>
                <h1 className="mt-1 text-3xl font-bold text-gray-900">
                  {user?.displayName || "No username set"}
                </h1>
                {profile?.createdAt ? (
                  <p className="mt-1 text-sm text-gray-500">
                    Joined {formatDateTime(profile.createdAt)}
                  </p>
                ) : null}
              </div>
            </div>

            {user ? (
              <Link
                href={`/users/${user.uid}`}
                className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
              >
                View public profile
              </Link>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Account</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-gray-500">Username</dt>
              <dd className="mt-1 text-gray-900">
                {user?.displayName || "No username set"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-gray-900">{user?.email}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-gray-900">
                {isModerator ? "Moderator" : "User"}
              </dd>
            </div>
          </dl>
          <p className="mt-6 text-gray-600">
            Your public page shows forum activity, but keeps private account
            details like email on this page only.
          </p>
        </div>
      </div>
    </ProtectedPage>
  );
}
