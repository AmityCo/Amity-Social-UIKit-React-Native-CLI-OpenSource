import React, { useCallback, useRef, useState } from 'react';

// import { useTranslation } from 'react-i18next';

import { FlatList, View } from 'react-native';
import { deletePostById, getGlobalFeed } from '../../providers/Social/feed-sdk';
import useAuth from '../../hooks/useAuth';
import PostList from '../../components/Social/PostList';
import { useStyle } from './styles';
import { amityPostsFormatter } from '../../util/postDataFormatter';
import { useDispatch, useSelector } from 'react-redux';
import globalFeedSlice from '../../redux/slices/globalfeedSlice';
import { RootState } from '../../redux/store';
import { useFocusEffect } from '@react-navigation/native';
import { RefreshControl } from 'react-native';
import MyStories from '../../components/MyStories';

export default function GlobalFeed() {
  const { postList } = useSelector((state: RootState) => state.globalFeed);
  const [refreshing, setRefreshing] = useState(false);
  const { deleteByPostId, setNewGlobalFeed } = globalFeedSlice.actions;
  const dispatch = useDispatch();
  const styles = useStyle();
  const { isConnected } = useAuth();
  const flatListRef = useRef(null);
  const onNextPageRef = useRef<() => void | null>(null);
  const unsubscribeRef = useRef<() => void | null>(null);

  const getGlobalFeedList = useCallback(() => {
    return getGlobalFeed({
      callback: ({ data, loading, onNextPage }) => {
        if (!loading && data) {
          amityPostsFormatter(data).then((posts) =>
            dispatch(setNewGlobalFeed(posts))
          );
        }

        onNextPageRef.current = onNextPage;
      },
    });
  }, [dispatch, setNewGlobalFeed]);

  const handleLoadMore = () => {
    onNextPageRef.current?.();
  };

  const onRefresh = useCallback(async () => {
    if (!unsubscribeRef.current) return;

    unsubscribeRef.current?.();
    unsubscribeRef.current = getGlobalFeedList();

    setRefreshing(false);
  }, [getGlobalFeedList]);

  useFocusEffect(
    useCallback(() => {
      if (isConnected) {
        unsubscribeRef.current = getGlobalFeedList();
      }
    }, [isConnected, getGlobalFeedList])
  );

  const onDeletePost = async (postId: string) => {
    const isDeleted = await deletePostById(postId);
    if (isDeleted) {
      dispatch(deleteByPostId({ postId }));
    }
  };

  return (
    <View style={styles.feedWrap}>
      <View style={styles.feedWrap}>
        <FlatList
          data={postList}
          renderItem={({ item, index }) => (
            <PostList
              onDelete={onDeletePost}
              postDetail={item}
              postIndex={index}
              isGlobalfeed={true}
            />
          )}
          keyExtractor={(item) => item.postId.toString()}
          onEndReachedThreshold={0.5}
          onEndReached={handleLoadMore}
          ref={flatListRef}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['lightblue']}
              tintColor="lightblue"
            />
          }
          extraData={postList}
          ListHeaderComponent={<MyStories />}
        />
      </View>
    </View>
  );
}
