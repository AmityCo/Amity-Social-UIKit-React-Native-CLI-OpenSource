// AmitySearchChannelPage — the navigation-destination wrapper for chat search,
// ported from AmityUiKitWeb v4/chat/pages/SearchChannelPage.
// Mounts SearchChannel inside a SafeAreaView; the SearchChannel Header owns the
// "Cancel" action that pops back to the chat home.
//
// RN adaptation: web wraps the page in `useAmityPage`'s theme/accessibility
// container; the RN pages use a plain SafeAreaView (mirrors AmityGroupMemberListPage).

import { SafeAreaView } from 'react-native';

import { SearchChannel } from '../../features/search';

export default function AmitySearchChannelPage() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SearchChannel />
    </SafeAreaView>
  );
}
