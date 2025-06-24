export const amityPostsFormatter = async (
  posts: Amity.Post<any>[]
): Promise<Amity.Post<any>[]> => {
  const formattedPostList = await Promise.all(
    posts.map(async (item: Amity.Post<any>) => {
      return {
        ...item,
        // postId: item.postId,
        // data: item.data as Record<string, any>,
        // dataType: item?.dataType ?? 'text',
        // myReactions: item.myReactions as string[],
        // reactionCount: item.reactions as Record<string, number>,
        // commentsCount: item.commentsCount,
        // user: userObject.data as UserInterface,
        // editedAt: item.editedAt,
        // createdAt: item.createdAt,
        // updatedAt: item.updatedAt,
        // targetType: item.targetType,
        // targetId: item.targetId,
        // childrenPosts: item.children,
        // mentionees: item.mentionees[0]?.userIds,
        // mentionPosition: item?.metadata?.mentioned || undefined,
        // path: item.path,
        // analytics: item.analytics,
      };
    })
  );
  return formattedPostList;
};
