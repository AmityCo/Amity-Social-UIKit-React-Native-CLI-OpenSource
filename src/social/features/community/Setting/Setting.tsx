import Header from './components/Header';
import { Title } from '../../../elements';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  bell,
  member,
  penFill,
  postPermission,
  story,
} from '../../../../core/assets/icons';
import Action from '../shared/elements/Action';
import { ElementID, PageID } from '../../../enums';
import LeaveCommunity from './elements/LeaveCommunity/LeaveCommunity';
import CloseCommunity from './elements/CloseCommunity';
import CloseCommunityDescription from './elements/CloseCommunityDescription';
import {
  checkDeleteCommunityPermission,
  checkEditCommunityPermission,
} from '../../../utils/permissions';
import { useCommunitySetting } from './hooks/useCommunitySetting';

type CommunitySettingProps = {
  community: Amity.Community;
};

const CommunitySetting = ({ community }: CommunitySettingProps) => {
  const {
    styles,
    handleCloseCommunity,
    handleLeaveCommunity,
    handleEditCommunity,
    handleCommunityMembership,
    handleCommunityPostPermission,
    handleCommunityStorySetting,
    handleCommunityNotificationSetting,
    isNotificationEnabled,
    isNetworkNotificationsEnabled,
  } = useCommunitySetting(community);

  return (
    <SafeAreaView style={styles.container}>
      <Header title={community?.displayName} />
      <ScrollView>
        <View style={styles.titleContainer}>
          <Title>Community information</Title>
        </View>
        {checkEditCommunityPermission(community.communityId) && (
          <Action
            iconProps={{ xml: penFill() }}
            onPress={handleEditCommunity}
            elementId={ElementID.edit_profile}
            pageId={PageID.community_setting_page}
          />
        )}
        <Action
          iconProps={{ xml: member() }}
          elementId={ElementID.members}
          onPress={handleCommunityMembership}
          pageId={PageID.community_setting_page}
        />
        <View style={styles.divider} />
        {checkEditCommunityPermission(community.communityId) && (
          <>
            <View style={styles.titleContainer}>
              <Title>Community permissions</Title>
            </View>
            <Action
              onPress={handleCommunityPostPermission}
              iconProps={{ xml: postPermission() }}
              elementId={ElementID.post_permission}
              pageId={PageID.community_setting_page}
            />
            <Action
              iconProps={{ xml: story() }}
              elementId={ElementID.story_setting}
              onPress={handleCommunityStorySetting}
              pageId={PageID.community_setting_page}
            />
            <View style={styles.divider} />
          </>
        )}
        {isNetworkNotificationsEnabled && (
          <>
            <View style={styles.titleContainer}>
              <Title>Your preferences</Title>
            </View>
            <Action
              description={isNotificationEnabled ? 'On' : 'Off'}
              iconProps={{ xml: bell() }}
              elementId={ElementID.notifications}
              pageId={PageID.community_setting_page}
              onPress={handleCommunityNotificationSetting}
            />
            <View style={styles.divider} />
          </>
        )}
        {community?.isJoined && (
          <>
            <LeaveCommunity
              onPress={handleLeaveCommunity}
              pageId={PageID.community_setting_page}
            />
          </>
        )}
        {checkDeleteCommunityPermission(community.communityId) && (
          <>
            <View style={styles.divider} />
            <CloseCommunity
              onPress={handleCloseCommunity}
              pageId={PageID.community_setting_page}
            />
            <CloseCommunityDescription pageId={PageID.community_setting_page} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CommunitySetting;
