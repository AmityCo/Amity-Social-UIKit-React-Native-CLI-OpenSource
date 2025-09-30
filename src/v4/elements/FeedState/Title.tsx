import React from 'react';
import { Typography } from '~/v4/component/Typography/Typography';
import { ComponentID, PageID, ElementID } from '~/v4/enum';
import { useStyles } from './styles';
import { useAmityElement } from '~/v4/hook';
import { Dimensions } from 'react-native';

type TitleProps = {
  pageId: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
};

export const Title = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.WildCardElement,
}: TitleProps) => {
  const { config, themeStyles, isExcluded } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const { width } = Dimensions.get('window');

  const styles = useStyles(themeStyles, width);

  if (isExcluded) return null;
  return (
    <Typography.TitleBold style={styles.title}>
      {config?.text as string}
    </Typography.TitleBold>
  );
};
