// GroupMembers — ported from AmityUiKitWeb v4/chat/features/group/members.
// The group member-list feature entry: a Header over the Members/Moderators tabs.
// `channelId` mirrors web's page prop; `onBack`/`onAddMember` are optional
// navigation callbacks supplied by the hosting page (navigation wiring is out of
// scope for this batch).

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports
import { Header } from './components/Header';
import { MemberTabs } from './components/MemberTabs';
import { useGroupMembers } from './hooks/useGroupMembers';
import { useStyles } from './styles';

// 3. Types
export type GroupMembersProps = {
  channelId: string;
  onBack?: () => void;
  onAddMember?: () => void;
};

// 4. Named function component
export function GroupMembers({
  channelId,
  onBack,
  onAddMember,
}: GroupMembersProps) {
  const { styles } = useStyles();
  const { isViewerModerator, handleBack, handleOpenAddMember } =
    useGroupMembers({
      channelId,
      onBack,
      onAddMember,
    });

  return (
    <View style={styles.groupMembers}>
      <Header
        onBack={handleBack}
        isViewerModerator={isViewerModerator}
        onAddMember={handleOpenAddMember}
      />
      <MemberTabs channelId={channelId} />
    </View>
  );
}
