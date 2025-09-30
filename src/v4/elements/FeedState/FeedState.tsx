import React from 'react';
import { View, Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { privateUserProfile } from '~/v4/../svg/svg-xml-list';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';
import { useStyles } from './styles';
import { ComponentID, ElementID, PageID } from '~/v4/enum';
import { Title } from './Title';
import { Icon } from './Icon';

const { width } = Dimensions.get('window');

type FeedStateProps = {
  pageId?: PageID;
  componentId?: ComponentID;
  titleElementId?: ElementID;
  subTitleElementId?: ElementID;
  iconElementId?: ElementID;
};

export const FeedState = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  titleElementId = ElementID.WildCardElement,
  subTitleElementId = ElementID.WildCardElement,
  iconElementId = ElementID.WildCardElement,
}: FeedStateProps) => {
  const theme = useTheme() as MyMD3Theme;
  const styles = useStyles(theme, width);

  return (
    <View style={styles.feedStateContainer}>
      {iconElementId && (
        <Icon
          pageId={pageId}
          componentId={componentId}
          elementId={iconElementId}
          icon={privateUserProfile()}
        />
      )}
      {titleElementId && (
        <Title
          pageId={pageId}
          componentId={componentId}
          elementId={titleElementId}
        />
      )}

      {subTitleElementId && (
        <Title
          pageId={pageId}
          componentId={componentId}
          elementId={subTitleElementId}
        />
      )}
    </View>
  );
};
