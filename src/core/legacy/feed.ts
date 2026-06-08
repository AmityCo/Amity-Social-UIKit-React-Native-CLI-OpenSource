import {
  createReport,
  deleteReport,
  FeedRepository,
  isReportedByMe,
  PostContentType,
  PostRepository,
  ReactionRepository,
} from '@amityco/ts-sdk-react-native';
import { IMentionPosition } from '../../core/types';

/**
 * Detects URLs in a text string and returns them as Amity.Link[] so other
 * platforms (console, web UIKit) can render them as clickable hyperlinks.
 *
 * Regex matches the spec at:
 * https://github.com/AmityCo/cleverden/blob/feat/frontend-agentic/tech-specs/18-links-detection-in-console.md
 * (same pattern used by the web UIKit in ~/v4/social/constants/post.ts)
 *
 * Key differences from a naive URL regex:
 *  - (?<![\w])  — negative lookbehind: don't match URLs embedded inside words
 *  - (?<![.])   — negative lookbehind: strip trailing dots from matched URLs
 *
 * A fresh RegExp is created each call to avoid stateful `lastIndex` issues
 * with the global flag.
 */
function extractLinks(text: string): Amity.Link[] {
  if (!text) return [];
  const urlPattern =
    /(?<![\w])(?:(?:https?|ftp):\/\/(?:[a-zA-Z0-9.-]+|[\d.]+)(?::\d{1,5})?(?:\/(?:[^\s<>|()]*(?:\([^\s<>|()]*\)[^\s<>|()]*)*)*)?(?<![.])|mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|www\.(?:[a-zA-Z0-9.-]+)(?:\/(?:[^\s<>|()]*(?:\([^\s<>|()]*\)[^\s<>|()]*)*)*)?(?<![.]))/g;
  const links: Amity.Link[] = [];
  let match: RegExpExecArray | null;
  while ((match = urlPattern.exec(text)) !== null) {
    links.push({
      index: match.index,
      length: match[0].length,
      url: match[0],
      renderPreview: true,
    });
  }
  return links;
}
import { Alert } from 'react-native';
import { text_contain_blocked_word } from '../constants';

export interface IGlobalFeedRes {
  data: Amity.Post<any>[];
  nextPage?: string;
  prevPage?: string;
}

export function getGlobalFeed({
  limit = 20,
  callback,
}: {
  limit?: number;
  callback: Amity.LiveCollectionCallback<Amity.Post>;
}): Amity.Unsubscriber {
  return FeedRepository.getCustomRankingGlobalFeed(
    {
      limit,
    },
    callback
  );
}

export async function addPostReaction(
  postId: string,
  reactionName: string
): Promise<boolean> {
  const reactionObject: Promise<boolean> = new Promise(
    async (resolve, reject) => {
      try {
        const isPostReactionAdded = await ReactionRepository.addReaction(
          'post',
          postId,
          reactionName
        );
        resolve(isPostReactionAdded);
      } catch (error) {
        reject(error);
      }
    }
  );
  return reactionObject;
}
export async function removePostReaction(
  postId: string,
  reactionName: string
): Promise<boolean> {
  const reactionObject: Promise<boolean> = new Promise(
    async (resolve, reject) => {
      try {
        const isPostReactionRemoved = await ReactionRepository.removeReaction(
          'post',
          postId,
          reactionName
        );
        resolve(isPostReactionRemoved);
      } catch (error) {
        reject(error);
      }
    }
  );
  return reactionObject;
}
export function getPostById(postId: string): Promise<any> {
  const communityObject = new Promise((resolve, reject) => {
    let object;
    const unsubscribe = PostRepository.getPost(
      postId,
      ({ data: postInfo, loading, error }) => {
        if (error) {
          reject(error);
        }
        if (!loading) {
          object = postInfo;
        }
      }
    );
    resolve({ data: object, unsubscribe });
  });
  return communityObject;
}
export async function createPostToFeed(
  targetType: string,
  targetId: string,
  content: { text: string; fileIds: string[] },
  postType: string,
  mentionees: string[],
  mentionPosition: IMentionPosition[]
): Promise<Amity.Post<any>> {
  const detectedLinks = extractLinks(content.text);
  let postParam = {
    targetType: targetType,
    targetId: targetId,
    mentionees:
      mentionees.length > 0
        ? ([
            { type: 'user', userIds: mentionees },
          ] as Amity.MentionType['user'][])
        : [],
    metadata: { mentioned: mentionPosition },
    ...(detectedLinks.length > 0 && { links: detectedLinks }),
  };
  if (postType === 'text') {
    const newPostParam = {
      data: {
        text: content.text,
      },
      ...postParam,
    };
    postParam = newPostParam;
  } else if (postType === 'image') {
    const formattedFileIds: { type: string; fileId: string }[] =
      content.fileIds.map((id) => {
        return { type: PostContentType.IMAGE, fileId: id };
      });
    const newPostParam = {
      data: {
        text: content.text,
      },
      attachments: formattedFileIds,
      ...postParam,
    };
    postParam = newPostParam;
  } else if (postType === 'video') {
    const formattedFileIds: { type: string; fileId: string }[] =
      content.fileIds.map((id) => {
        return { type: PostContentType.VIDEO, fileId: id };
      });
    const newPostParam = {
      data: {
        text: content.text,
      },
      attachments: formattedFileIds,
      ...postParam,
    };
    postParam = newPostParam;
  }
  const createPostObject: Promise<Amity.Post<any>> = new Promise(
    async (resolve, reject) => {
      try {
        const { data: post } = await PostRepository.createPost(postParam);
        resolve(post);
      } catch (error) {
        if (error.message.includes(text_contain_blocked_word)) {
          Alert.alert('', text_contain_blocked_word);
        }
        reject(error);
      }
    }
  );
  return createPostObject;
}

export async function editPost(
  postId: string,
  content: { text: string; fileIds: string[] },
  postType: string,
  mentionees: string[],
  mentionPosition: IMentionPosition[]
): Promise<Amity.Post<any>> {
  const detectedLinks = extractLinks(content.text);
  let postParam = {
    mentionees:
      mentionees.length > 0
        ? ([
            { type: 'user', userIds: mentionees },
          ] as Amity.MentionType['user'][])
        : [],
    metadata: { mentioned: mentionPosition },
    ...(detectedLinks.length > 0 && { links: detectedLinks }),
  };
  if (postType === 'text') {
    const newPostParam = {
      data: {
        text: content.text,
        attachments: [],
      },
      ...postParam,
    };
    postParam = newPostParam;
  } else if (postType === 'image') {
    const formattedFileIds: { type: string; fileId: string }[] =
      content.fileIds.map((id) => {
        return { type: PostContentType.IMAGE, fileId: id };
      });
    const newPostParam = {
      data: {
        text: content.text,
      },
      attachments: formattedFileIds,
      ...postParam,
    };
    postParam = newPostParam;
  } else if (postType === 'video') {
    const formattedFileIds: { type: string; fileId: string }[] =
      content.fileIds.map((id) => {
        return { type: PostContentType.VIDEO, fileId: id };
      });
    const newPostParam = {
      data: {
        text: content.text,
      },
      attachments: formattedFileIds,
      ...postParam,
    };
    postParam = newPostParam;
  }
  const editPostObject: Promise<Amity.Post<any>> = new Promise(
    async (resolve, reject) => {
      try {
        const { data: post } = await PostRepository.editPost(postId, postParam);
        resolve(post);
      } catch (error) {
        if (error.message.includes(text_contain_blocked_word)) {
          Alert.alert('', text_contain_blocked_word);
        }
        reject(error);
      }
    }
  );
  return editPostObject;
}
export async function deletePostById(postId: string): Promise<boolean> {
  const isDeletedObject: Promise<boolean> = new Promise(
    async (resolve, reject) => {
      try {
        const softDeleted = await PostRepository.deletePost(postId, false);
        if (softDeleted) {
          resolve(true);
        }
      } catch (error) {
        reject(error);
      }
    }
  );
  return isDeletedObject;
}
export async function reportTargetById(
  targetType: 'post' | 'comment',
  postId: string
): Promise<boolean> {
  const isReport: Promise<boolean> = new Promise(async (resolve, reject) => {
    try {
      const didCreatePostReport = await createReport(targetType, postId);
      if (didCreatePostReport) {
        resolve(didCreatePostReport);
      }
    } catch (error) {
      reject(error);
    }
  });
  return isReport;
}
export async function isReportTarget(
  targetType: 'post' | 'comment' | 'user',
  targetId: string
): Promise<boolean> {
  const isReport: Promise<boolean> = new Promise(async (resolve, reject) => {
    try {
      const isReportByMe = await isReportedByMe(targetType, targetId);
      if (isReportByMe) {
        resolve(isReportByMe);
      }
    } catch (error) {
      reject(error);
    }
  });
  return isReport;
}

export async function unReportTargetById(
  targetType: 'post' | 'comment',
  targetId: string
): Promise<boolean> {
  const isReport: Promise<boolean> = new Promise(async (resolve, reject) => {
    try {
      const didDeletePostReport = await deleteReport(targetType, targetId);
      if (didDeletePostReport) {
        resolve(didDeletePostReport);
      }
    } catch (error) {
      reject(error);
    }
  });
  return isReport;
}
