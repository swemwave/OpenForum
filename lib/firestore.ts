import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type UserProfile = {
  username: string;
  email: string;
  avatarUrl: string;
  role: string;
  createdAt: string;
};

export async function createUserProfile(uid: string, data: UserProfile) {
  await setDoc(doc(db, "users", uid), data);
}

export async function getUserProfile(uid: string) {
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return null;
  return snapshot.data();
}