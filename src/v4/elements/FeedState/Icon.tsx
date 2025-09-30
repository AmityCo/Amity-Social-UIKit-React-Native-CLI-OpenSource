import React from 'react';
import { ComponentID, PageID, ElementID } from '~/v4/enum';
import { useStyles } from './styles';
import { useAmityElement } from '~/v4/hook';
import { Dimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';

type IconProps = {
  pageId: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
  icon: string;
};

export const Icon = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.WildCardElement,
  icon,
}: IconProps) => {
  const { themeStyles, isExcluded } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const { width } = Dimensions.get('window');

  const styles = useStyles(themeStyles, width);

  if (isExcluded) return null;
  return <SvgXml style={styles.feedStateIcon} xml={icon} />;
};
