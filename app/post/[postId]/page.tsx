"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import CommentThread from "@/components/CommentThread";
import {
  createComment,
  deleteComment,
  deletePost,
  getPost,
  getPostVote,
  listCommentsByPost,
  updateComment,
  updatePost,
  voteOnPost,
} from "@/lib/forum";
import {
  COMMENT_CONTENT_MAX_LENGTH,
  POST_CONTENT_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
} from "@/lib/limits";
import type { ForumComment, ForumPost, VoteValue } from "@/lib/types";
import { formatDateTime, getErrorMessage, getUserIdentity } from "@/lib/utils";

export default function PostDetailPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const { user, isModerator } = useAuth();
  const postId = params.postId;
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [currentVote, setCurrentVote] = useState<VoteValue | 0>(0);
  const [commentContent, setCommentContent] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [voteError, setVoteError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDiscussion() {
      try {
        setLoading(true);
        const [postData, commentData] = await Promise.all([
          getPost(postId),
          listCommentsByPost(postId),
        ]);

        if (!isMounted) {
          return;
        }

        setPost(postData);
        setComments(commentData);
        setEditedTitle(postData?.title ?? "");
        setEditedContent(postData?.content ?? "");
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(getErrorMessage(loadError));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadDiscussion();

    return () => {
      isMounted = false;
    };
  }, [postId]);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentVote() {
      if (!user) {
        setCurrentVote(0);
        return;
      }

      try {
        setVoteError("");
        const vote = await getPostVote(postId, user.uid);

        if (!isMounted) {
          return;
        }

        setCurrentVote(vote);
      } catch (loadVoteError) {
        if (!isMounted) {
          return;
        }

        setVoteError(getErrorMessage(loadVoteError));
      }
    }

    void loadCurrentVote();

    return () => {
      isMounted = false;
    };
  }, [postId, user]);

  async function refreshDiscussion() {
    const [postData, commentData] = await Promise.all([
      getPost(postId),
      listCommentsByPost(postId),
    ]);

    setPost(postData);
    setComments(commentData);

    if (postData) {
      setEditedTitle(postData.title);
      setEditedContent(postData.content);
    }
  }

  async function handlePostUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setError("You need to be logged in to edit a post.");
      return;
    }

    try {
      setBusy(true);
      setError("");
      await updatePost(postId, user.uid, {
        title: editedTitle,
        content: editedContent,
      });
      await refreshDiscussion();
      setIsEditingPost(false);
    } catch (updateError) {
      setError(getErrorMessage(updateError));
    } finally {
      setBusy(false);
    }
  }

  async function handlePostDelete() {
    if (!user || !post) {
      return;
    }

    const shouldDelete = window.confirm(
      isOwner ? "Delete this post?" : "Remove this post as a moderator?"
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setBusy(true);
      setError("");
      await deletePost(post.id, user.uid, isModerator);
      router.push(`/community/${post.communityId}`);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
      setBusy(false);
    }
  }

  async function handleVote(value: VoteValue) {
    const identity = getUserIdentity(user);

    if (!identity) {
      setVoteError("You need to be logged in to vote.");
      return;
    }

    if (!post || post.isDeleted) {
      return;
    }

    try {
      setVoteLoading(true);
      setVoteError("");
      const nextVote = await voteOnPost(post.id, identity, value);
      setCurrentVote(nextVote);
      await refreshDiscussion();
    } catch (voteSubmitError) {
      setVoteError(getErrorMessage(voteSubmitError));
    } finally {
      setVoteLoading(false);
    }
  }

  async function handleRootCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCommentError("");

    const identity = getUserIdentity(user);

    if (!identity) {
      setCommentError("You need to be logged in to comment.");
      return;
    }

    try {
      setBusy(true);
      await createComment(
        {
          postId,
          content: commentContent,
        },
        identity
      );
      setCommentContent("");
      await refreshDiscussion();
    } catch (submitError) {
      setCommentError(getErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  async function handleReply(parentCommentId: string, content: string) {
    const identity = getUserIdentity(user);

    if (!identity) {
      throw new Error("You need to be logged in to reply.");
    }

    await createComment(
      {
        postId,
        parentCommentId,
        content,
      },
      identity
    );

    await refreshDiscussion();
  }

  async function handleCommentEdit(commentId: string, content: string) {
    if (!user) {
      throw new Error("You need to be logged in to edit a comment.");
    }

    await updateComment(commentId, user.uid, content);
    await refreshDiscussion();
  }

  async function handleCommentDelete(commentId: string) {
    if (!user) {
      throw new Error("You need to be logged in to delete a comment.");
    }

    await deleteComment(commentId, user.uid);
    await refreshDiscussion();
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
        Loading post...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
        This post could not be found.
      </div>
    );
  }

  const isOwner = user?.uid === post.authorId;
  const canManagePost = (isOwner || isModerator) && !post.isDeleted;
  const voteScore = post.upvoteCount - post.downvoteCount;
  const upvoteLabel = voteLoading
    ? "Saving..."
    : currentVote === 1
      ? "Upvoted"
      : "Upvote";
  const downvoteLabel = voteLoading
    ? "Saving..."
    : currentVote === -1
      ? "Downvoted"
      : "Downvote";

  return (
    <section className="space-y-8">
      <article className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <Link href={`/community/${post.communityId}`} className="font-medium">
            {post.communityName}
          </Link>
          <span>
            By{" "}
            <Link
              href={`/users/${post.authorId}`}
              className="font-medium text-gray-700 hover:underline"
            >
              {post.authorName}
            </Link>
          </span>
          <span>{formatDateTime(post.createdAt)}</span>
          <span>
            {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
          </span>
          <span>{voteScore} {voteScore === 1 ? "point" : "points"}</span>
        </div>

        <div className="mt-6">
          {post.isDeleted ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-gray-600">
              This post has been deleted.
            </div>
          ) : isEditingPost ? (
            <form onSubmit={handlePostUpdate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(event) => setEditedTitle(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
                  maxLength={POST_TITLE_MAX_LENGTH}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <textarea
                  rows={8}
                  value={editedContent}
                  onChange={(event) => setEditedContent(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
                  maxLength={POST_CONTENT_MAX_LENGTH}
                  required
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
                >
                  {busy ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingPost(false);
                    setEditedTitle(post.title);
                    setEditedContent(post.content);
                    setError("");
                  }}
                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">{post.title}</h1>
              <p className="whitespace-pre-wrap text-lg text-gray-700">
                {post.content}
              </p>
            </div>
          )}
        </div>

        {!post.isDeleted ? (
          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900">
                  {voteScore} {voteScore === 1 ? "point" : "points"}
                </p>
                <p>
                  {post.upvoteCount} upvote
                  {post.upvoteCount === 1 ? "" : "s"} - {post.downvoteCount}{" "}
                  downvote{post.downvoteCount === 1 ? "" : "s"}
                </p>
              </div>

              {user ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void handleVote(1)}
                    disabled={voteLoading}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                      currentVote === 1
                        ? "bg-black text-white"
                        : "border border-gray-300 bg-white text-gray-700"
                    }`}
                  >
                    {upvoteLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleVote(-1)}
                    disabled={voteLoading}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                      currentVote === -1
                        ? "bg-black text-white"
                        : "border border-gray-300 bg-white text-gray-700"
                    }`}
                  >
                    {downvoteLabel}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  <Link href="/login" className="font-medium text-gray-900 underline">
                    Log in
                  </Link>{" "}
                  to vote on this post.
                </p>
              )}
            </div>

            {voteError ? (
              <p className="mt-3 text-sm text-red-600">{voteError}</p>
            ) : null}
          </div>
        ) : null}

        {canManagePost ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {isOwner ? (
              <button
                type="button"
                onClick={() => {
                  setIsEditingPost(true);
                  setError("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
              >
                Edit post
              </button>
            ) : null}
            <button
              type="button"
              onClick={handlePostDelete}
              disabled={busy}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
            >
              {isOwner ? "Delete post" : "Remove post"}
            </button>
            {!isOwner && isModerator ? (
              <span className="rounded-lg bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800">
                Moderator action
              </span>
            ) : null}
          </div>
        ) : null}
      </article>

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Comments</h2>
          <p className="mt-1 text-gray-600">
            Nested replies are supported, and comment authors can edit or delete
            their own comments.
          </p>
        </div>

        {user && !post.isDeleted ? (
          <form
            onSubmit={handleRootCommentSubmit}
            className="rounded-2xl bg-white p-6 shadow-sm"
          >
            <label className="block text-sm font-medium text-gray-700">
              Add a comment
            </label>
            <textarea
              rows={4}
              value={commentContent}
              onChange={(event) => setCommentContent(event.target.value)}
              placeholder="Join the discussion"
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
              maxLength={COMMENT_CONTENT_MAX_LENGTH}
              required
            />

            {commentError ? (
              <p className="mt-3 text-sm text-red-600">{commentError}</p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="mt-4 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
            >
              {busy ? "Posting..." : "Post comment"}
            </button>
          </form>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
            {post.isDeleted ? (
              "Comments are locked because this post was deleted."
            ) : (
              <>
                <Link href="/login" className="font-medium text-gray-900 underline">
                  Log in
                </Link>{" "}
                to join the discussion.
              </>
            )}
          </div>
        )}

        <CommentThread
          comments={comments}
          currentUserId={post.isDeleted ? undefined : user?.uid}
          onReply={handleReply}
          onEdit={handleCommentEdit}
          onDelete={handleCommentDelete}
        />
      </div>
    </section>
  );
}
