import React, { FC, memo } from 'react';
import { useAmityComponent } from '../../../hook';
import { PageID, ComponentID } from '../../../enum';
import { emptyCommunity } from '../../../assets/icons';
import TitleElement from '../../Elements/TitleElement/TitleElement';
import DescriptionElement from '../../Elements/DescriptionElement/DescriptionElement';
import { View } from 'react-native';
import { useStyles } from './styles';
import { SvgXml } from 'react-native-svg';
import ExploreCreateCommunity from '../../../elements/ExploreCreateCommunity/ExploreCreateCommunity';

type AmityExploreCommunityEmptyComponentProps = {
  pageId?: PageID;
};

const AmityExploreCommunityEmptyComponent: FC<
  AmityExploreCommunityEmptyComponentProps
> = ({ pageId = PageID.WildCardPage }) => {
  const componentId = ComponentID.explore_community_empty;
  const { isExcluded, accessibilityId } = useAmityComponent({
    pageId,
    componentId,
  });

  const styles = useStyles();

  if (isExcluded) return null;

  return (
    <View testID={accessibilityId} style={styles.container}>
      <SvgXml xml={emptyCommunity({})} />
      <TitleElement
        pageId={pageId}
        componentId={componentId}
        style={styles.title}
      />
      <DescriptionElement
        pageId={pageId}
        componentId={componentId}
        style={styles.description}
      />
      <ExploreCreateCommunity
        pageId={pageId}
        componentId={componentId}
        style={styles.createCommunityButton}
        // TODO: add onPress handler
      />
    </View>
  );
};
export default memo(AmityExploreCommunityEmptyComponent);
