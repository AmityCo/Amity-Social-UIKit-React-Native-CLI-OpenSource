import React from 'react';
import { FlatList, View, TouchableOpacity } from 'react-native';
import {
  useAmityElement,
  useAmityPage,
  useCommunities,
  useUser,
} from '../../hook';
import TargetItem from './TargetItem/TargetItem';
import { Divider, useTheme } from 'react-native-paper';
import useAuth from '../../../hooks/useAuth';
import type { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';
import CloseButtonIconElement from '../../PublicApi/Elements/CloseButtonIconElement/CloseButtonIconElement';
import { PageID, ComponentID, ElementID } from '../../enum';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import TextKeyElement from '../../PublicApi/Elements/TextKeyElement/TextKeyElement';
import { Typography } from '../Typography/Typography';
import { useStyles } from './styles';

export type FeedParams = {
  targetId: string;
  targetType: 'user' | 'community';
  community?: Amity.Community;
  targetName?: string;
  isPublic?: boolean;
  postSetting?: ValueOf<
    Readonly<{
      ONLY_ADMIN_CAN_POST: 'ONLY_ADMIN_CAN_POST';
      ADMIN_REVIEW_POST_REQUIRED: 'ADMIN_REVIEW_POST_REQUIRED';
      ANYONE_CAN_POST: 'ANYONE_CAN_POST';
    }>
  >;
  needApprovalOnPostCreation?: boolean;
  hideMyTimelineTarget?: boolean;
};

interface ITargetSelectionPage {
  pageId: PageID;
  hideMyTimelineTarget?: boolean;
  onSelectFeed: ({
    community,
    targetId,
    targetName,
    targetType,
    isPublic,
    postSetting,
    needApprovalOnPostCreation,
  }: FeedParams) => void;
}

const TargetSelectionPage = ({
  pageId,
  hideMyTimelineTarget = false,
  onSelectFeed,
}: ITargetSelectionPage) => {
  const { client } = useAuth();
  const navigation = useNavigation();
  const defaultTheme = useTheme() as MyMD3Theme;

  const user = useUser((client as Amity.Client).userId);
  const { communities, onNextCommunityPage } = useCommunities();
  const { themeStyles, accessibilityId } = useAmityPage({ pageId });

  const theme = themeStyles || defaultTheme;
  const styles = useStyles(theme);

  const { config: myTimelineConfig } = useAmityElement({
    pageId,
    componentId: ComponentID.WildCardComponent,
    elementId: ElementID.my_timeline_text,
  });

  const renderItem = ({ item }: { item: Amity.Community }) => {
    return (
      <TargetItem
        key={item.communityId}
        displayName={item.displayName}
        isBadgeShow={item.isOfficial}
        isPrivate={!item.isPublic}
        onSelect={() =>
          onSelectFeed({
            targetId: item.communityId,
            targetName: item.displayName,
            targetType: 'community',
            community: item,
          })
        }
        avatarElementId={ElementID.community_avatar}
        avatarFileId={item.avatarFileId}
      />
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <CloseButtonIconElement style={styles.closeIcon} pageID={pageId} />
        </TouchableOpacity>
        <TextKeyElement
          style={styles.title}
          pageID={pageId}
          componentID={ComponentID.WildCardComponent}
          elementID={ElementID.title}
        />
      </View>
      {!hideMyTimelineTarget && (
        <>
          <TargetItem
            pageId={pageId}
            displayNameElementId={ElementID.my_timeline_text}
            displayName={(myTimelineConfig?.text as string) || 'My timeline'}
            avatarElementId={ElementID.my_timeline_avatar}
            onSelect={() =>
              onSelectFeed({
                targetId: user.userId,
                targetName: (myTimelineConfig?.text as string) || 'My timeline',
                targetType: 'user',
              })
            }
            avatarFileId={user?.avatarFileId}
          />
          <View style={styles.divider}>
            <Divider
              theme={{ colors: { outlineVariant: theme.colors.baseShade4 } }}
            />
          </View>
          <Typography.Body style={styles.communityHeader}>
            My communities
          </Typography.Body>
        </>
      )}
      <FlatList
        data={communities}
        renderItem={renderItem}
        onEndReached={onNextCommunityPage}
        keyExtractor={(item) => item.communityId.toString()}
      />
    </SafeAreaView>
  );
};

export default React.memo(TargetSelectionPage);
