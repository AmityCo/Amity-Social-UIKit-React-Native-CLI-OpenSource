import React from 'react';
import { useStyles } from './styles';
import { TextProps } from 'react-native';
import { useAmityElement } from '../../../social/hooks';
import { Typography } from '../../component/Typography/Typography';
import { ComponentID, ElementID, PageID } from '../../enums/enumUIKitID';

type TitleProps = Partial<TextProps> & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
  variant?: 'title' | 'body';
};

function Title({
  children,
  variant = 'title',
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.title,
  ...props
}: TitleProps) {
  const { isExcluded, accessibilityId, config, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });
  const styles = useStyles(themeStyles);

  if (isExcluded) return null;

  const $Typography =
    variant === 'title' ? Typography.TitleBold : Typography.BodyBold;

  return (
    <$Typography
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
      style={[styles.title, props.style]}
      {...props}
    >
      {(config?.text as string) ?? children}
    </$Typography>
  );
}

export default Title;
