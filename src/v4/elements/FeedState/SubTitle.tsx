import React from 'react';
import { Typography } from '~/v4/component/Typography/Typography';
import { ComponentID, PageID, ElementID } from '~/v4/enum';
import { useStyles } from './styles';
import { useAmityElement } from '~/v4/hook';
import { Dimensions } from 'react-native';

type SubTitleProps = {
  pageId: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
};

export const SubTitle = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.WildCardElement,
}: SubTitleProps) => {
  const { config, themeStyles, isExcluded } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const { width } = Dimensions.get('window');

  const styles = useStyles(themeStyles, width);

  if (isExcluded) return null;
  return (
    <Typography.Caption style={styles.subTitle}>
      {config?.text as string}
    </Typography.Caption>
  );
};
