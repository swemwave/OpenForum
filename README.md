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
