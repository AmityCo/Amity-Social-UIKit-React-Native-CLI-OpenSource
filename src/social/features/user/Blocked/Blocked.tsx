import { SafeAreaView } from 'react-native-safe-area-context';
import { useStyles } from './styles';
import { TopBar, UserList } from './components';
import { useAmityPage } from '../../../hooks';
import { PageID } from '../../../enums';

export function Blocked() {
  const { styles } = useStyles();
  const { accessibilityId } = useAmityPage({
    pageId: PageID.blocked_users_page,
  });

  return (
    <SafeAreaView
      testID={accessibilityId}
      style={styles.container}
      edges={['top']}
    >
      <TopBar />
      <UserList />
    </SafeAreaView>
  );
}
