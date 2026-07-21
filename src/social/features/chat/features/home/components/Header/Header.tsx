// Header — ported from AmityUiKitWeb v4/chat/features/home/components/Header.
// The web header hosts a title plus action buttons (search / create / menu /
// network status). M2 adds the create-chat ("+") button; search + the overflow
// menu land in M4.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { Typography } from '../../../../../../../core/design/components/Typography';
import { useString } from '../../../../../../../core/localization';
import { CreateChatMenu } from '../../elements/CreateChatMenu';
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
      <CreateChatMenu enabledChannelTypes={['conversation', 'community']} />
    </View>
  );
}
