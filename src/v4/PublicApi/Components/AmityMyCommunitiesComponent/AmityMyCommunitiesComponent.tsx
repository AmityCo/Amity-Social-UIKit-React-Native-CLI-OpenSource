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
import { emptyCommunity, plus } from '../../../assets/icons';
import { Typography } from '../../../component/Typography/Typography';
import { SvgXml } from 'react-native-svg';
import { Button } from '../../../component/Button/Button';

type AmityMyCommunitiesComponentType = {
  pageId?: PageID;
  componentId?: ComponentID;
};

const AmityMyCommunitiesComponent: FC<AmityMyCommunitiesComponentType> = ({
  pageId = PageID.WildCardPage,
}) => {
  const componentId = ComponentID.my_communities;
  const { isExcluded, accessibilityId, themeStyles } = useAmityComponent({
    pageId,
    componentId,
  });
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { AmityMyCommunitiesComponentBehaviour } = useBehaviour();
  const styles = useStyles(themeStyles);
  const { communities, onNextCommunityPage, loading } = useCommunities();

  const onPressCommunity = useCallback(
    ({ communityId }: { communityId: string }) => {
      if (AmityMyCommunitiesComponentBehaviour.onPressCommunity)
        return AmityMyCommunitiesComponentBehaviour.onPressCommunity();
      navigation.navigate('CommunityProfilePage', {
        communityId,
      });
    },
    [navigation, AmityMyCommunitiesComponentBehaviour]
  );

  // Empty state cannot be customized
  const renderEmptyState = useCallback(() => {
    return (
      <View style={styles.emptyContainer}>
        <SvgXml xml={emptyCommunity({})} />
        <Typography.BodyBold style={styles.emptyTitleText}>
          {'No community yet'}
        </Typography.BodyBold>
        <Typography.Caption style={styles.emptyDescriptionText}>
          {"Let's create your own communities"}
        </Typography.Caption>
        <Button
          type="primary"
          icon={<SvgXml xml={plus()} />}
          themeStyle={themeStyles}
          style={styles.createCommunityButton}
        >
          <Typography.BodyBold style={styles.createCommunityButtonText}>
            {'Create community'}
          </Typography.BodyBold>
        </Button>
      </View>
    );
  }, [styles, themeStyles]);

  if (isExcluded) return null;

  return (
    <View
      style={styles.container}
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
    >
      {!loading && communities?.length === 0 ? (
        renderEmptyState()
      ) : (
        <CommunitySearchResult
          pageId={pageId}
          componentId={componentId}
          isFirstTimeLoading={loading && !communities}
          isLoading={loading}
          communities={communities}
          onPressCommunity={onPressCommunity}
          onNextPage={onNextCommunityPage}
        />
      )}
    </View>
  );
};

export default memo(AmityMyCommunitiesComponent);
