// AmityUiKitChat — the chat UIKit entry point (mirrors AmityUiKitSocial).
// Mounts the shared navigator starting at the chat home page.

import AmitySocialUIKitV4Navigator from './AmityUIKitNavigator';

export default function AmityUiKitChat() {
  return <AmitySocialUIKitV4Navigator initialRouteName="AmityChatHomePage" />;
}
