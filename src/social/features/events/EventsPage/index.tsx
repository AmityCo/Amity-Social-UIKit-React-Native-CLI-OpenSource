import { memo } from 'react';
import { SafeAreaView } from 'react-native';
import { useStyles } from './styles';
import AmityEventsComponent from '../EventsHub';
import { useAmityPage } from '../../../hooks';
import { PageID } from '../../../enums';

/**
 * Standalone Events hub page (`events_page`). The Events tab on
 * AmitySocialHomePage renders the same hub component inline, mirroring how
 * Web mounts <Events /> inside SocialHomePage.
 */
const AmityEventsPage = () => {
  const pageId = PageID.events_page;
  const { isExcluded, accessibilityId } = useAmityPage({ pageId });
  const { styles } = useStyles();

  if (isExcluded) return null;

  return (
    <SafeAreaView
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
      style={styles.container}
    >
      <AmityEventsComponent pageId={pageId} />
    </SafeAreaView>
  );
};

export default memo(AmityEventsPage);
