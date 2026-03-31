export type UserProfile = {
  username: string;
  email: string;
  avatarUrl: string;
  role: string;
  createdAt: string;
};

export type ForumUserIdentity = {
  uid: string;
  displayName: string;
};

export type Community = {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
  postCount: number;
  slug: string;
};

export type ForumPost = {
  id: string;
  communityId: string;
  communityName: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  isDeleted: boolean;
};

export type ForumComment = {
  id: string;
  postId: string;
  communityId: string;
  parentCommentId: string | null;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
};

export type CommentTreeNode = ForumComment & {
  replies: CommentTreeNode[];
};
