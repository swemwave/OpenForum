# OpenForum

OpenForum is a Reddit-style discussion app built with Next.js, Firebase Authentication, and Firestore.

## Features

- User registration, login, logout, and protected routes
- Community creation and community directory listing
- Global search for communities and posts
- Community detail pages with in-community post creation
- Dynamic routes for communities and posts
- Firestore-backed posts, communities, comments, and user profiles
- Public user profile pages with posts and created communities
- Nested comment threads with replies
- Post upvotes and downvotes
- Moderator role with post removal permissions
- Edit and delete flows for posts and comments

## Routes

- `/` home page with search, community listing, and recent posts
- `/community` community directory
- `/community/create` create a community
- `/community/[communityId]` community detail page and in-community post composer
- `/post/create` choose a community to post in
- `/post/[postId]` post detail page with threaded comments
- `/users/[userId]` public user profile with forum activity
- `/login`, `/register`, `/profile`

## Firestore Collections

- `users`
- `publicProfiles`
- `communities`
- `posts`
- `comments`
- `postVotes`

## Roles

Users are created with the `user` role by default. To make a moderator, set a user's `users/{uid}.role` field to `moderator` from trusted Firebase admin tooling, then deploy the Firestore rules. If you also want the public profile badge to show moderator status, set `publicProfiles/{uid}.role` to `moderator` from trusted admin tooling too.

## Local Setup

Copy `.env.example` to `.env.local` and fill in the Firebase web app values before running the app.
