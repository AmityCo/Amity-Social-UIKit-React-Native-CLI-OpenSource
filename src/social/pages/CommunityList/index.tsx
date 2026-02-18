/* eslint-disable react-hooks/exhaustive-deps */
import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useStyles } from './styles';
import CloseButton from '../../components/legacy/BackButton';
import useAuth from '../../../core/hooks/useAuth';

export default function CommunityList({ navigation, route }: any) {
  const { apiRegion } = useAuth();
  const [communities, setCommunities] = useState<Amity.Community[]>([]);
  const [paginateLoading, setPaginateLoading] = useState(false);
  const { categoryId, categoryName } = route.params;
  const [hasNextPage, setHasNextPage] = useState(false);

  const styles = useStyles();
  const onNextPageRef = useRef<(() => void) | null>(null);
  const isFetchingRef = useRef(false);
  const onEndReachedCalledDuringMomentumRef = useRef(true);
  const renderHeaderLeft = React.useCallback(() => <CloseButton />, []);
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: renderHeaderLeft,
      title: categoryName,
    });
  }, [navigation, renderHeaderLeft, categoryName]);
  useEffect(() => {
    const loadCommunities = async () => {
      setPaginateLoading(true);
      try {
        const unsubscribe = CommunityRepository.getCommunities(
          { categoryId: categoryId },
          ({
            data: communityData,
            onNextPage: nextPage,
            hasNextPage: hasMore,
            loading,
          }) => {
            if (!loading) {
              setCommunities((prevCommunities) => [
                ...prevCommunities,
                ...communityData,
              ]);
              setHasNextPage(hasMore);
              onNextPageRef.current = nextPage;
              isFetchingRef.current = false;
              unsubscribe();
            }
          }
        );
      } catch (error) {
        console.error('Failed to load communities:', error);
        isFetchingRef.current = false;
      } finally {
        setPaginateLoading(false);
      }
    };

    loadCommunities();
  }, []);
  const onPressCommunity = useCallback(
    ({
      communityId,
      communityName,
    }: {
      communityId: string;
      communityName: string;
    }) => {
      navigation.navigate('CommunityHome', { communityId, communityName });
    },
    []
  );

  const renderCommunity = ({ item }: { item: Amity.Community }) => {
    return (
      <TouchableOpacity
        style={styles.rowContainer}
        onPress={() =>
          onPressCommunity({
            communityId: item.communityId,
            communityName: item.displayName,
          })
        }
      >
        <Image
          style={styles.avatar}
          source={
            item.avatarFileId
              ? {
                  uri: `https://api.${apiRegion}.amity.co/api/v3/files/${item.avatarFileId}/download`,
                }
              : require('../../../../assets/icon/Placeholder.png')
          }
        />
        <Text style={styles.categoryText}>{item.displayName}</Text>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!paginateLoading) return null;
    return (
      <View style={styles.LoadingIndicator}>
        <ActivityIndicator size="large" />
      </View>
    );
  };

  const handleEndReached = useCallback(() => {
    if (
      !isFetchingRef.current &&
      hasNextPage &&
      !onEndReachedCalledDuringMomentumRef.current
    ) {
      isFetchingRef.current = true;
      onEndReachedCalledDuringMomentumRef.current = true;
      onNextPageRef.current && onNextPageRef.current();
    }
  }, [hasNextPage]);

  return (
    <View style={styles.container}>
      <FlatList
        data={communities}
        renderItem={renderCommunity}
        keyExtractor={(item) => item.communityId.toString()}
        ListFooterComponent={renderFooter}
        // onEndReached={handleEndReached}
        onEndReached={handleEndReached}
        onMomentumScrollBegin={() =>
          (onEndReachedCalledDuringMomentumRef.current = false)
        }
        onEndReachedThreshold={0.8}
      />
    </View>
  );
}
