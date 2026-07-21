// Header — ported from AmityUiKitWeb v4/chat/features/home/components/Header.
// The web header hosts a title plus a right-aligned actions group
// (SearchButton / CreateChatMenu / ChatHomeMenu), in that order.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { Typography } from '../../../../../../../core/design/components/Typography';
import { useString } from '../../../../../../../core/localization';
import { SearchButton } from '../../elements/SearchButton';
import { CreateChatMenu } from '../../elements/CreateChatMenu';
import { ChatHomeMenu } from '../../elements/ChatHomeMenu';
import { useStyles } from './styles';

// 3. Named function component
export function Header() {
  const { styles } = useStyles();
  const title = useString('amity_chat_home_title');

  return (
    <View style={styles.header}>
      <Typography variant="headline" style={styles.title} numberOfLines={1}>
        {title}
      </Typography>
      <View style={styles.actions}>
        <SearchButton />
        <CreateChatMenu enabledChannelTypes={['conversation', 'community']} />
        <ChatHomeMenu />
      </View>
    </View>
  );
}
