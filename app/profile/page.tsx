"use client";

import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/components/AuthProvider";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <ProtectedPage>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold">Profile</h1>
        <p><strong>Username:</strong> {user?.displayName || "No username set"}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p className="mt-4 text-gray-600">
          More profile information will be added in the next sprint.
        </p>
      </div>
    </ProtectedPage>
  );
}