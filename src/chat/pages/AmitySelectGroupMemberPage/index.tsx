// AmitySelectGroupMemberPage — pick members for a new group (step 1 of create).
import { SafeAreaView } from 'react-native-safe-area-context';

import { SelectGroupMember } from '../../features/group/select-member';

export default function AmitySelectGroupMemberPage() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      <SelectGroupMember />
    </SafeAreaView>
  );
}
