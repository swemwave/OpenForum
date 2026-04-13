import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile } from "@/lib/firestore";
import { USERNAME_MAX_LENGTH } from "@/lib/limits";

export async function registerUser(
  username: string,
  email: string,
  password: string
) {
  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedUsername || !normalizedEmail || !password) {
    throw new Error("Username, email, and password are required.");
  }

  if (normalizedUsername.length > USERNAME_MAX_LENGTH) {
    throw new Error(`Username must be ${USERNAME_MAX_LENGTH} characters or less.`);
  }

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    normalizedEmail,
    password
  );

  await updateProfile(userCredential.user, {
    displayName: normalizedUsername,
  });

  await createUserProfile(userCredential.user.uid, {
    username: normalizedUsername,
    email: normalizedEmail,
    avatarUrl: "",
    role: "user",
    createdAt: new Date().toISOString(),
  });

  return userCredential.user;
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    throw new Error("Email and password are required.");
  }

  const userCredential = await signInWithEmailAndPassword(
    auth,
    normalizedEmail,
    password
  );
  return userCredential.user;
}

export async function logoutUser() {
  await signOut(auth);
}
