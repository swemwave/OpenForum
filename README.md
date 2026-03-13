# OpenForum

OpenForum is a community discussion platform built for my Web Development 2 project.

It is designed to be a simple Reddit-style forum where users can create accounts, join discussions, make posts, and interact with communities.

## Features

- User registration and login
- Logout functionality
- Protected pages for logged-in users
- Home page
- Login page
- Register page
- Profile page
- Create Community page
- Create Post page
- Firebase Authentication
- Firebase Firestore connection
- Next.js App Router
- Vercel deployment

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Firebase Firestore
- Vercel

## Project Structure

```text
app/
  community/
    create/
      page.tsx
  login/
    page.tsx
  post/
    create/
      page.tsx
  profile/
    page.tsx
  register/
    page.tsx
  globals.css
  layout.tsx
  page.tsx

components/
  AuthProvider.tsx
  Navbar.tsx
  ProtectedPage.tsx

lib/
  auth.ts
  firebase.ts
  firestore.ts