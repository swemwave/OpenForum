"use client";

import { FormEvent, useState } from "react";
import type { CommentTreeNode, ForumComment } from "@/lib/types";
import { buildCommentTree, formatDateTime, getErrorMessage } from "@/lib/utils";

type CommentThreadProps = {
  comments: ForumComment[];
  currentUserId?: string;
  onReply: (parentCommentId: string, content: string) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
};

type CommentItemProps = {
  comment: CommentTreeNode;
  depth?: number;
  currentUserId?: string;
  onReply: (parentCommentId: string, content: string) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
};

function CommentItem({
  comment,
  depth = 0,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const isOwner = currentUserId === comment.authorId;
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(comment.content);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleReplySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      setBusy(true);
      await onReply(comment.id, replyContent);
      setReplyContent("");
      setIsReplying(false);
    } catch (replyError) {
      setError(getErrorMessage(replyError));
    } finally {
      setBusy(false);
    }
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      setBusy(true);
      await onEdit(comment.id, editContent);
      setIsEditing(false);
    } catch (editError) {
      setError(getErrorMessage(editError));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    const shouldDelete = window.confirm("Delete this comment?");

    if (!shouldDelete) {
      return;
    }

    setError("");

    try {
      setBusy(true);
      await onDelete(comment.id);
      setIsEditing(false);
      setIsReplying(false);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={depth > 0 ? "mt-4 border-l border-gray-200 pl-5" : ""}>
      <article className="rounded-xl bg-gray-50 p-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <span className="font-medium text-gray-900">{comment.authorName}</span>
          <span>{formatDateTime(comment.createdAt)}</span>
          {comment.updatedAt !== comment.createdAt && !comment.isDeleted ? (
            <span className="text-xs uppercase tracking-wide text-gray-400">
              edited
            </span>
          ) : null}
        </div>

        <div className="mt-3">
          {comment.isDeleted ? (
            <p className="italic text-gray-500">[comment deleted]</p>
          ) : isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <textarea
                rows={4}
                value={editContent}
                onChange={(event) => setEditContent(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Edit your comment"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
                >
                  {busy ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                    setError("");
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="whitespace-pre-wrap text-gray-700">{comment.content}</p>
          )}
        </div>

        {!comment.isDeleted ? (
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {currentUserId ? (
              <button
                type="button"
                onClick={() => {
                  setIsReplying((current) => !current);
                  setIsEditing(false);
                  setError("");
                }}
                className="font-medium text-gray-700"
              >
                Reply
              </button>
            ) : null}

            {isOwner ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing((current) => !current);
                    setIsReplying(false);
                    setError("");
                  }}
                  className="font-medium text-gray-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={busy}
                  className="font-medium text-red-600"
                >
                  Delete
                </button>
              </>
            ) : null}
          </div>
        ) : null}

        {isReplying ? (
          <form onSubmit={handleReplySubmit} className="mt-4 space-y-3">
            <textarea
              rows={3}
              value={replyContent}
              onChange={(event) => setReplyContent(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Write your reply"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
              >
                {busy ? "Replying..." : "Reply"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent("");
                  setError("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </article>

      {comment.replies.length > 0 ? (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              currentUserId={currentUserId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function CommentThread({
  comments,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
}: CommentThreadProps) {
  const commentTree = buildCommentTree(comments);

  if (commentTree.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
        No comments yet. Start the discussion.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {commentTree.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
