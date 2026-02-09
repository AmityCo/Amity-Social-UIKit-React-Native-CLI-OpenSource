export const amityPostsFormatter = async (
  posts: Amity.Post<any>[]
): Promise<Amity.Post<any>[]> => {
  const formattedPostList = await Promise.all(
    posts.map(async (item: Amity.Post<any>) => {
      return {
        ...item,
      };
    })
  );
  return formattedPostList;
};
