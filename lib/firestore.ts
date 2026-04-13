import { doc, getDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PublicUserProfile, UserProfile, UserRole } from "@/lib/types";

export async function createUserProfile(uid: string, data: UserProfile) {
  const batch = writeBatch(db);

  batch.set(doc(db, "users", uid), data);
  batch.set(doc(db, "publicProfiles", uid), {
    username: data.username,
    avatarUrl: data.avatarUrl,
    role: data.role,
    createdAt: data.createdAt,
  });

  await batch.commit();
}

export async function getUserProfile(uid: string) {
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserProfile;
}

function normalizeRole(role: unknown): UserRole {
  return role === "moderator" ? "moderator" : "user";
}

export async function getPublicUserProfile(uid: string) {
  const snapshot = await getDoc(doc(db, "publicProfiles", uid));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as Partial<UserProfile>;

  return {
    id: snapshot.id,
    username: data.username || "OpenForum User",
    avatarUrl: data.avatarUrl || "",
    role: normalizeRole(data.role),
    createdAt: data.createdAt || "",
  } satisfies PublicUserProfile;
}
