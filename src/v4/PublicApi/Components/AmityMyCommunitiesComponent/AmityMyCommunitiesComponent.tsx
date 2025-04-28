import { View } from 'react-native';
import React, { FC, memo, useCallback } from 'react';
import { useStyles } from './styles';
import { useAmityComponent, useCommunities } from '../../../hook/';
import { PageID, ComponentID } from '../../../enum';
import { useNavigation } from '@react-navigation/native';
import { useBehaviour } from '../../../providers/BehaviourProvider';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes/RouteParamList';
import CommunitySearchResult from '../../../component/CommunitySearchResult/CommunitySearchResult';

type AmityMyCommunitiesComponentType = {
  pageId?: PageID;
  componentId?: ComponentID;
};

const AmityMyCommunitiesComponent: FC<AmityMyCommunitiesComponentType> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}) => {
  const { isExcluded, accessibilityId } = useAmityComponent({
    pageId,
    componentId,
  });
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { AmityMyCommunitiesComponentBehaviour } = useBehaviour();
  const styles = useStyles();
  const { communities, onNextCommunityPage, loading } = useCommunities();

  const onPressCommunity = useCallback(
    ({ communityId, communityName }: { communityId; communityName }) => {
      if (AmityMyCommunitiesComponentBehaviour.onPressCommunity)
        return AmityMyCommunitiesComponentBehaviour.onPressCommunity();
      navigation.navigate('CommunityHome', {
        communityId,
        communityName,
      });
    },
    [navigation, AmityMyCommunitiesComponentBehaviour]
  );

  if (isExcluded) return null;

  return (
    <View
      style={styles.container}
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
    >
      <CommunitySearchResult
        pageId={pageId}
        componentId={componentId}
        isFirstTimeLoading={loading && !communities}
        isLoading={loading}
        communities={communities}
        onPressCommunity={onPressCommunity}
        onNextPage={onNextCommunityPage}
      />
    </View>
  );
};

export default memo(AmityMyCommunitiesComponent);
