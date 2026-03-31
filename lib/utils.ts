import type { User } from "firebase/auth";
import type { CommentTreeNode, ForumComment, ForumUserIdentity } from "@/lib/types";

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export function getUserIdentity(user: User | null): ForumUserIdentity | null {
  if (!user) {
    return null;
  }

  return {
    uid: user.uid,
    displayName:
      user.displayName || user.email?.split("@")[0] || "OpenForum User",
  };
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function truncateText(value: string, maxLength = 180) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildCommentTree(comments: ForumComment[]) {
  const sortedComments = [...comments].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  );

  const commentMap = new Map<string, CommentTreeNode>();
  const roots: CommentTreeNode[] = [];

  sortedComments.forEach((comment) => {
    commentMap.set(comment.id, {
      ...comment,
      replies: [],
    });
  });

  sortedComments.forEach((comment) => {
    const currentComment = commentMap.get(comment.id);

    if (!currentComment) {
      return;
    }

    if (comment.parentCommentId) {
      const parent = commentMap.get(comment.parentCommentId);

      if (parent) {
        parent.replies.push(currentComment);
        return;
      }
    }

    roots.push(currentComment);
  });

  return roots;
}
