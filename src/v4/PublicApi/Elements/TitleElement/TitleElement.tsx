import React, { FC, memo } from 'react';
import { Typography } from '../../../component/Typography/Typography';
import { StyleSheet, TextProps } from 'react-native';
import { ComponentID, ElementID, PageID } from '../../../enum/enumUIKitID';
import { useAmityElement } from '../../../hook';

type TitleElementType = Partial<TextProps> & {
  pageId?: PageID;
  componentId?: ComponentID;
};

const TitleElement: FC<TitleElementType> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  style,
  ...props
}) => {
  const elementId = ElementID.title;
  const { isExcluded, accessibilityId, config, themeStyles } = useAmityElement({
    pageId: pageId,
    componentId: componentId,
    elementId,
  });

  const styles = StyleSheet.create({
    titleText: {
      color: themeStyles.colors.baseShade3,
    },
  });

  if (isExcluded) return null;

  return (
    <Typography.BodyBold
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
      style={[styles.titleText, style]}
      {...props}
    >
      {config.text as string}
    </Typography.BodyBold>
  );
};

export default memo(TitleElement);
