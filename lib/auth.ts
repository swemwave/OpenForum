import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile } from "@/lib/firestore";

export async function registerUser(
  username: string,
  email: string,
  password: string
) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  if (auth.currentUser) {
    await updateProfile(auth.currentUser, {
      displayName: username,
    });
  }

  await createUserProfile(userCredential.user.uid, {
    username,
    email,
    avatarUrl: "",
    role: "user",
    createdAt: new Date().toISOString(),
  });

  return userCredential.user;
}

export async function loginUser(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function logoutUser() {
  await signOut(auth);
}