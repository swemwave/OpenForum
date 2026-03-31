# OpenForum

OpenForum is a Reddit-style discussion app built with Next.js, Firebase Authentication, and Firestore.

## Features

- User registration, login, logout, and protected routes
- Community creation and community directory listing
- Global search for communities and posts
- Community detail pages with in-community post creation
- Dynamic routes for communities and posts
- Firestore-backed posts, communities, comments, and user profiles
- Nested comment threads with replies
- Edit and delete flows for posts and comments

## Routes

- `/` home page with search, community listing, and recent posts
- `/community` community directory
- `/community/create` create a community
- `/community/[communityId]` community detail page and in-community post composer
- `/post/create` choose a community to post in
- `/post/[postId]` post detail page with threaded comments
- `/login`, `/register`, `/profile`

## Firestore Collections

- `users`
- `communities`
- `posts`
- `comments`

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` with your Firebase web app values:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. In Firebase Console:
   - Enable Authentication with Email/Password.
   - Create a Firestore database.
   - Add the rules from `firestore.rules`.

4. Start the app:

   ```bash
   npm run dev
   ```

## Notes

- Search is implemented in the client by filtering loaded communities and posts.
- Posts and comments use soft delete so discussion links stay stable.
- The included Firestore rules are suitable for a course project or prototype. Tighten them before using this app in production.
