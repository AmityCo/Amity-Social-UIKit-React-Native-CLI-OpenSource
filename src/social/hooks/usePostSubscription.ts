import { useEffect, useState } from 'react';
import {
  getPostTopic,
  PostRepository,
  subscribeTopic,
} from '@amityco/ts-sdk-react-native';

export const usePostSubscription = (postId: string) => {
  const [subscribedPost, setSubscribedPost] = useState<Amity.Post>(null);

  useEffect(() => {
    let unsubscribe: () => void;
    if (postId) {
      unsubscribe = PostRepository.getPost(postId, ({ data }) => {
        setSubscribedPost(data);
      });
    }
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [postId]);

  useEffect(() => {
    let unsubscribe: () => void;
    if (subscribedPost) {
      unsubscribe = subscribeTopic(getPostTopic(subscribedPost));
    }
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [subscribedPost]);

  return { subscribedPost };
};
