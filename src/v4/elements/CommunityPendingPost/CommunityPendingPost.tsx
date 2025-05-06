import React, { FC } from 'react';
import { ComponentID, ElementID, PageID } from '../../enum';
import { useAmityElement } from '../../hook';
import { StyleSheet, ViewProps } from 'react-native';
import { View } from 'react-native';
import { Typography } from '../../component/Typography/Typography';
import { SvgXml } from 'react-native-svg';
import { dot } from '../../assets/icons';

type CommunityPendingPostProps = ViewProps & {
  number: number;
  pageId?: PageID;
  componentId?: ComponentID;
};

const CommunityPendingPost: FC<CommunityPendingPostProps> = ({
  number = 0,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
}) => {
  const elementId = ElementID.community_pending_post;
  const { isExcluded, accessibilityId, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'column',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      backgroundColor: themeStyles.colors.backgroundShade1,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    title: {
      color: themeStyles.colors.base,
    },
    description: {
      color: themeStyles.colors.baseShade2,
    },
  });

  if (isExcluded || number === 0) return null;

  return (
    <View testID={accessibilityId} {...props}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <SvgXml xml={dot()} />
          <Typography.BodyBold style={styles.title}>
            {'Pending posts'}
          </Typography.BodyBold>
        </View>
        <Typography.Caption style={styles.description}>{`${number} post${
          number > 1 ? 's' : ''
        } need approval`}</Typography.Caption>
      </View>
    </View>
  );
};

export default CommunityPendingPost;
