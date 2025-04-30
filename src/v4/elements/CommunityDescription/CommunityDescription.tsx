import React, { FC } from 'react';
import { ComponentID, ElementID, PageID } from '../../enum';
import { useAmityElement } from '../../hook';
import { StyleSheet, ViewProps } from 'react-native';
import ReadMore from '@fawazahmed/react-native-read-more';
import { View } from 'react-native';

type CommunityDescriptionProps = ViewProps & {
  description: string;
  pageId?: PageID;
  componentId?: ComponentID;
};

const CommunityDescription: FC<CommunityDescriptionProps> = ({
  description,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
}) => {
  const elementId = ElementID.community_description;
  const { isExcluded, accessibilityId, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const styles = StyleSheet.create({
    description: {
      color: themeStyles.colors.base,
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 20,
    },
    seeMore: {
      color: themeStyles.colors.primary,
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 20,
    },
  });

  if (isExcluded) return null;

  return (
    <View testID={accessibilityId} {...props}>
      <ReadMore
        style={styles.description}
        numberOfLines={4}
        expandOnly={true}
        seeMoreStyle={styles.seeMore}
      >
        {description}
      </ReadMore>
    </View>
  );
};

export default CommunityDescription;
