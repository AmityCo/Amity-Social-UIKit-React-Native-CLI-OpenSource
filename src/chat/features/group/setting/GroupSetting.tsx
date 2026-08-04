// GroupSetting — group chat settings screen, ported from AmityUiKitWeb
// v4/chat/features/group/setting/GroupSetting. A header + group avatar over one
// or two sections of tappable SettingMenu rows, then a destructive "Leave group".
//
// RN adaptations from web:
//   - `<div>` → View; the page scrolls via ScrollView (web relied on document flow).
//   - Web resolved the avatar from the SDK File; RN's Avatar.GroupChat takes a
//     resolved `avatarUrl` + `isPublic` (the hook resolves the url via useFile).
//   - Section titles use Typography `titleBold`; the inter-section divider only
//     renders when both sections have visible rows. The "Your preferences" section
//     holds the per-user "Notifications" row (visible to all members); the group
//     section's moderator-only "Group notifications" mode row shows for moderators.

// 1. React / RN imports
import { ScrollView, View } from 'react-native';

// 2. Internal imports (relative)
import { Typography } from '../../../../core/design/components/Typography';
import { Avatar } from '../../../elements/Avatar';
import { SettingMenu } from '../../../elements/SettingMenu';
import { Header } from './components/Header/Header';
import {
  useGroupSetting,
  type GroupSettingProps,
} from './hooks/useGroupSetting';
import { useStyles } from './styles';

// 3. Named function component
export function GroupSetting({ channelId }: GroupSettingProps) {
  const { styles } = useStyles();
  const {
    title,
    avatarUrl,
    groupSettingsSection,
    yourPreferencesSection,
    leaveGroupLabel,
    handleClose,
    handleLeaveGroup,
    visibleGroupItems,
    visiblePreferenceItems,
  } = useGroupSetting({ channelId });

  return (
    <View style={styles.container}>
      <Header title={title} onBack={handleClose} />
      <ScrollView>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Avatar.GroupChat avatarUrl={avatarUrl} size="lg" />
          </View>
        </View>

        {visibleGroupItems.length > 0 && (
          <View style={styles.section}>
            <Typography variant="titleBold" style={styles.sectionTitle}>
              {groupSettingsSection}
            </Typography>
            {visibleGroupItems.map(
              ({ key, visible: _visible, ...itemProps }) => (
                <SettingMenu key={key} {...itemProps} />
              )
            )}
          </View>
        )}

        {visibleGroupItems.length > 0 && visiblePreferenceItems.length > 0 && (
          <View style={styles.divider} />
        )}

        {visiblePreferenceItems.length > 0 && (
          <View style={styles.section}>
            <Typography variant="titleBold" style={styles.sectionTitle}>
              {yourPreferencesSection}
            </Typography>
            {visiblePreferenceItems.map(
              ({ key, visible: _visible, ...itemProps }) => (
                <SettingMenu key={key} {...itemProps} />
              )
            )}
          </View>
        )}

        <View style={styles.section}>
          <SettingMenu
            destructive
            label={leaveGroupLabel}
            onPress={handleLeaveGroup}
            accessibilityLabel={leaveGroupLabel}
          />
        </View>
      </ScrollView>
    </View>
  );
}
