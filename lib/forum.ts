import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  runTransaction,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  COMMENT_CONTENT_MAX_LENGTH,
  COMMUNITY_DESCRIPTION_MAX_LENGTH,
  COMMUNITY_NAME_MAX_LENGTH,
  POST_CONTENT_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
} from "@/lib/limits";
import type {
  Community,
  ForumComment,
  ForumPost,
  ForumUserIdentity,
  VoteValue,
} from "@/lib/types";
import { slugify } from "@/lib/utils";

type CommunityRecord = Omit<Community, "id">;
type PostRecord = Omit<ForumPost, "id">;
type CommentRecord = Omit<ForumComment, "id">;

type CreateCommunityInput = {
  name: string;
  description: string;
};

type CreatePostInput = {
  communityId: string;
  title: string;
  content: string;
};

type CreateCommentInput = {
  postId: string;
  parentCommentId?: string | null;
  content: string;
};

type UpdatePostInput = {
  title: string;
  content: string;
};

type CommunitySnapshotData = CommunityRecord;
type PostSnapshotData = Omit<
  PostRecord,
  "upvoteCount" | "downvoteCount"
> &
  Partial<Pick<PostRecord, "upvoteCount" | "downvoteCount">>;
type CommentSnapshotData = CommentRecord;

function sortByNewest<T extends { createdAt: string }>(items: T[]) {
  return items.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

function sortByOldest<T extends { createdAt: string }>(items: T[]) {
  return items.sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  );
}

function requireMaxLength(value: string, maxLength: number, fieldName: string) {
  if (value.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or less.`);
  }
}

function mapCommunity(
  id: string,
  data: CommunitySnapshotData
): Community {
  return {
    id,
    ...data,
  };
}

function mapPost(id: string, data: PostSnapshotData): ForumPost {
  return {
    id,
    ...data,
    upvoteCount: data.upvoteCount ?? 0,
    downvoteCount: data.downvoteCount ?? 0,
  };
}

function mapComment(id: string, data: CommentSnapshotData): ForumComment {
  return {
    id,
    ...data,
  };
}

async function getLivePostCountsByCommunity() {
  const snapshot = await getDocs(collection(db, "posts"));
  const postCounts = new Map<string, number>();

  snapshot.docs.forEach((postDoc) => {
    const post = mapPost(postDoc.id, postDoc.data() as PostSnapshotData);

    if (!post.isDeleted) {
      postCounts.set(post.communityId, (postCounts.get(post.communityId) ?? 0) + 1);
    }
  });

  return postCounts;
}

function applyLivePostCounts(
  communities: Community[],
  postCounts: Map<string, number>
) {
  return communities.map((community) => ({
    ...community,
    postCount: postCounts.get(community.id) ?? 0,
  }));
}

async function requireCommunity(communityId: string) {
  const communityRef = doc(db, "communities", communityId);
  const snapshot = await getDoc(communityRef);

  if (!snapshot.exists()) {
    throw new Error("Community not found.");
  }

  return mapCommunity(snapshot.id, snapshot.data() as CommunitySnapshotData);
}

async function requirePost(postId: string) {
  const postRef = doc(db, "posts", postId);
  const snapshot = await getDoc(postRef);

  if (!snapshot.exists()) {
    throw new Error("Post not found.");
  }

  return mapPost(snapshot.id, snapshot.data() as PostSnapshotData);
}

async function requireComment(commentId: string) {
  const commentRef = doc(db, "comments", commentId);
  const snapshot = await getDoc(commentRef);

  if (!snapshot.exists()) {
    throw new Error("Comment not found.");
  }

  return mapComment(snapshot.id, snapshot.data() as CommentSnapshotData);
}

export async function createCommunity(
  input: CreateCommunityInput,
  actor: ForumUserIdentity
) {
  const timestamp = new Date().toISOString();
  const normalizedName = input.name.trim();
  const normalizedDescription = input.description.trim();

  if (!normalizedName || !normalizedDescription) {
    throw new Error("Community name and description are required.");
  }

  requireMaxLength(normalizedName, COMMUNITY_NAME_MAX_LENGTH, "Community name");
  requireMaxLength(
    normalizedDescription,
    COMMUNITY_DESCRIPTION_MAX_LENGTH,
    "Community description"
  );

  const community: CommunityRecord = {
    name: normalizedName,
    description: normalizedDescription,
    creatorId: actor.uid,
    creatorName: actor.displayName,
    createdAt: timestamp,
    updatedAt: timestamp,
    postCount: 0,
    slug: slugify(normalizedName),
  };

  const docRef = await addDoc(collection(db, "communities"), community);
  return docRef.id;
}

export async function listCommunities() {
  const [snapshot, postCounts] = await Promise.all([
    getDocs(collection(db, "communities")),
    getLivePostCountsByCommunity(),
  ]);
  const communities = snapshot.docs.map((communityDoc) =>
    mapCommunity(communityDoc.id, communityDoc.data() as CommunitySnapshotData)
  );

  return sortByNewest(applyLivePostCounts(communities, postCounts));
}

export async function getCommunity(communityId: string) {
  const snapshot = await getDoc(doc(db, "communities", communityId));

  if (!snapshot.exists()) {
    return null;
  }

  return mapCommunity(snapshot.id, snapshot.data() as CommunitySnapshotData);
}

export async function createPost(
  input: CreatePostInput,
  actor: ForumUserIdentity
) {
  const community = await requireCommunity(input.communityId);
  const timestamp = new Date().toISOString();
  const normalizedTitle = input.title.trim();
  const normalizedContent = input.content.trim();

  if (!normalizedTitle || !normalizedContent) {
    throw new Error("Post title and content are required.");
  }

  requireMaxLength(normalizedTitle, POST_TITLE_MAX_LENGTH, "Post title");
  requireMaxLength(normalizedContent, POST_CONTENT_MAX_LENGTH, "Post content");

  const post: PostRecord = {
    communityId: community.id,
    communityName: community.name,
    title: normalizedTitle,
    content: normalizedContent,
    authorId: actor.uid,
    authorName: actor.displayName,
    createdAt: timestamp,
    updatedAt: timestamp,
    commentCount: 0,
    upvoteCount: 0,
    downvoteCount: 0,
    isDeleted: false,
  };

  const postRef = await addDoc(collection(db, "posts"), post);
  await updateDoc(doc(db, "communities", community.id), {
    postCount: increment(1),
    updatedAt: timestamp,
  });

  return postRef.id;
}

export async function listPosts() {
  const snapshot = await getDocs(collection(db, "posts"));
  const posts = snapshot.docs
    .map((postDoc) => mapPost(postDoc.id, postDoc.data() as PostSnapshotData))
    .filter((post) => !post.isDeleted);

  return sortByNewest(posts);
}

export async function listPostsByCommunity(communityId: string) {
  const snapshot = await getDocs(
    query(collection(db, "posts"), where("communityId", "==", communityId))
  );
  const posts = snapshot.docs
    .map((postDoc) => mapPost(postDoc.id, postDoc.data() as PostSnapshotData))
    .filter((post) => !post.isDeleted);

  return sortByNewest(posts);
}

export async function listPostsByAuthor(authorId: string) {
  const snapshot = await getDocs(
    query(collection(db, "posts"), where("authorId", "==", authorId))
  );
  const posts = snapshot.docs
    .map((postDoc) => mapPost(postDoc.id, postDoc.data() as PostSnapshotData))
    .filter((post) => !post.isDeleted);

  return sortByNewest(posts);
}

export async function listCommunitiesByCreator(creatorId: string) {
  const [snapshot, postCounts] = await Promise.all([
    getDocs(
      query(collection(db, "communities"), where("creatorId", "==", creatorId))
    ),
    getLivePostCountsByCommunity(),
  ]);
  const communities = snapshot.docs.map((communityDoc) =>
    mapCommunity(communityDoc.id, communityDoc.data() as CommunitySnapshotData)
  );

  return sortByNewest(applyLivePostCounts(communities, postCounts));
}

export async function getPost(postId: string) {
  const snapshot = await getDoc(doc(db, "posts", postId));

  if (!snapshot.exists()) {
    return null;
  }

  return mapPost(snapshot.id, snapshot.data() as PostSnapshotData);
}

export async function updatePost(
  postId: string,
  actorUid: string,
  input: UpdatePostInput
) {
  const post = await requirePost(postId);

  if (post.authorId !== actorUid) {
    throw new Error("You can only edit your own posts.");
  }

  if (post.isDeleted) {
    throw new Error("Deleted posts cannot be edited.");
  }

  const normalizedTitle = input.title.trim();
  const normalizedContent = input.content.trim();

  if (!normalizedTitle || !normalizedContent) {
    throw new Error("Post title and content are required.");
  }

  requireMaxLength(normalizedTitle, POST_TITLE_MAX_LENGTH, "Post title");
  requireMaxLength(normalizedContent, POST_CONTENT_MAX_LENGTH, "Post content");

  await updateDoc(doc(db, "posts", postId), {
    title: normalizedTitle,
    content: normalizedContent,
    updatedAt: new Date().toISOString(),
  });
}

export async function deletePost(
  postId: string,
  actorUid: string,
  canModerate = false
) {
  const post = await requirePost(postId);

  if (post.authorId !== actorUid && !canModerate) {
    throw new Error("Only the author or a moderator can delete this post.");
  }

  if (post.isDeleted) {
    return;
  }

  const timestamp = new Date().toISOString();

  if (canModerate) {
    await deleteDoc(doc(db, "posts", postId));
    return;
  }

  await updateDoc(doc(db, "posts", postId), {
    title: "[deleted]",
    content: "",
    isDeleted: true,
    updatedAt: timestamp,
  });

  await updateDoc(doc(db, "communities", post.communityId), {
    postCount: increment(-1),
    updatedAt: timestamp,
  });
}

function getPostVoteRef(postId: string, userId: string) {
  return doc(db, "postVotes", postId, "users", userId);
}

export async function getPostVote(
  postId: string,
  userId: string
): Promise<VoteValue | 0> {
  const voteSnapshot = await getDoc(getPostVoteRef(postId, userId));

  if (!voteSnapshot.exists()) {
    return 0;
  }

  const value = voteSnapshot.data().value;
  return value === 1 || value === -1 ? value : 0;
}

export async function voteOnPost(
  postId: string,
  actor: ForumUserIdentity,
  value: VoteValue
): Promise<VoteValue | 0> {
  const postRef = doc(db, "posts", postId);
  const voteRef = getPostVoteRef(postId, actor.uid);
  const timestamp = new Date().toISOString();

  return runTransaction(db, async (transaction) => {
    const postSnapshot = await transaction.get(postRef);

    if (!postSnapshot.exists()) {
      throw new Error("Post not found.");
    }

    const post = mapPost(postSnapshot.id, postSnapshot.data() as PostSnapshotData);

    if (post.isDeleted) {
      throw new Error("You cannot vote on a deleted post.");
    }

    const voteSnapshot = await transaction.get(voteRef);
    const existingVoteData = voteSnapshot.exists() ? voteSnapshot.data() : null;
    const existingValue: VoteValue | 0 =
      existingVoteData?.value === 1 || existingVoteData?.value === -1
        ? existingVoteData.value
        : 0;
    const nextValue: VoteValue | 0 = existingValue === value ? 0 : value;
    const upvoteDelta =
      (nextValue === 1 ? 1 : 0) - (existingValue === 1 ? 1 : 0);
    const downvoteDelta =
      (nextValue === -1 ? 1 : 0) - (existingValue === -1 ? 1 : 0);
    transaction.update(postRef, {
      upvoteCount: Math.max(0, post.upvoteCount + upvoteDelta),
      downvoteCount: Math.max(0, post.downvoteCount + downvoteDelta),
    });

    if (nextValue === 0) {
      transaction.delete(voteRef);
      return nextValue;
    }

    transaction.set(voteRef, {
      postId,
      userId: actor.uid,
      value: nextValue,
      createdAt: existingVoteData?.createdAt ?? timestamp,
      updatedAt: timestamp,
    });

    return nextValue;
  });
}

export async function createComment(
  input: CreateCommentInput,
  actor: ForumUserIdentity
) {
  const post = await requirePost(input.postId);

  if (post.isDeleted) {
    throw new Error("You cannot comment on a deleted post.");
  }

  const normalizedContent = input.content.trim();

  if (!normalizedContent) {
    throw new Error("Comment content is required.");
  }

  requireMaxLength(normalizedContent, COMMENT_CONTENT_MAX_LENGTH, "Comment content");

  if (input.parentCommentId) {
    const parentComment = await requireComment(input.parentCommentId);

    if (parentComment.postId !== post.id) {
      throw new Error("Replies must stay inside the same post.");
    }
  }

  const timestamp = new Date().toISOString();
  const comment: CommentRecord = {
    postId: post.id,
    communityId: post.communityId,
    parentCommentId: input.parentCommentId ?? null,
    content: normalizedContent,
    authorId: actor.uid,
    authorName: actor.displayName,
    createdAt: timestamp,
    updatedAt: timestamp,
    isDeleted: false,
  };

  const commentRef = await addDoc(collection(db, "comments"), comment);
  await updateDoc(doc(db, "posts", post.id), {
    commentCount: increment(1),
    updatedAt: timestamp,
  });

  return commentRef.id;
}

export async function listCommentsByPost(postId: string) {
  const snapshot = await getDocs(
    query(collection(db, "comments"), where("postId", "==", postId))
  );
  const comments = snapshot.docs.map((commentDoc) =>
    mapComment(commentDoc.id, commentDoc.data() as CommentSnapshotData)
  );

  return sortByOldest(comments);
}

export async function listCommentsByAuthor(authorId: string) {
  const snapshot = await getDocs(
    query(collection(db, "comments"), where("authorId", "==", authorId))
  );
  const comments = snapshot.docs.map((commentDoc) =>
    mapComment(commentDoc.id, commentDoc.data() as CommentSnapshotData)
  );

  return sortByNewest(comments);
}

export async function updateComment(
  commentId: string,
  actorUid: string,
  content: string
) {
  const comment = await requireComment(commentId);

  if (comment.authorId !== actorUid) {
    throw new Error("You can only edit your own comments.");
  }

  if (comment.isDeleted) {
    throw new Error("Deleted comments cannot be edited.");
  }

  const normalizedContent = content.trim();

  if (!normalizedContent) {
    throw new Error("Comment content is required.");
  }

  requireMaxLength(normalizedContent, COMMENT_CONTENT_MAX_LENGTH, "Comment content");

  await updateDoc(doc(db, "comments", commentId), {
    content: normalizedContent,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteComment(commentId: string, actorUid: string) {
  const comment = await requireComment(commentId);

  if (comment.authorId !== actorUid) {
    throw new Error("You can only delete your own comments.");
  }

  if (comment.isDeleted) {
    return;
  }

  const timestamp = new Date().toISOString();

  await updateDoc(doc(db, "comments", commentId), {
    content: "",
    isDeleted: true,
    updatedAt: timestamp,
  });

  await updateDoc(doc(db, "posts", comment.postId), {
    commentCount: increment(-1),
    updatedAt: timestamp,
  });
}
