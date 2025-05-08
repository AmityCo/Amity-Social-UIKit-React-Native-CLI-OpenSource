import React, { FC, memo } from 'react';
import { Typography } from '../../../component/Typography/Typography';
import { StyleSheet, TextProps } from 'react-native';
import { ComponentID, ElementID, PageID } from '../../../enum/enumUIKitID';
import { useAmityElement } from '../../../hook';

type DescriptionElementType = Partial<TextProps> & {
  pageId?: PageID;
  componentId?: ComponentID;
};

const DescriptionElement: FC<DescriptionElementType> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  style,
  ...props
}) => {
  const elementId = ElementID.description;
  const { isExcluded, accessibilityId, config, themeStyles } = useAmityElement({
    pageId: pageId,
    componentId: componentId,
    elementId,
  });

  const styles = StyleSheet.create({
    descriptionText: {
      color: themeStyles.colors.baseShade3,
    },
  });

  if (isExcluded) return null;

  return (
    <Typography.Caption
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
      style={[styles.descriptionText, style]}
      {...props}
    >
      {config.text as string}
    </Typography.Caption>
  );
};

export default memo(DescriptionElement);
