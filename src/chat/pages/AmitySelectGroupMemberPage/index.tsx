// AmitySelectGroupMemberPage — pick members for a new group (step 1 of create).
import { SafeAreaView } from 'react-native';

import { SelectGroupMember } from '../../features/group/select-member';

export default function AmitySelectGroupMemberPage() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SelectGroupMember />
    </SafeAreaView>
  );
}
