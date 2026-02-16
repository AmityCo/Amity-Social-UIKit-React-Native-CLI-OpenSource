import React from 'react';
import { useStyles } from './styles';
import { useAmityElement } from '../../../social/hooks';
import { ComponentID, ElementID, PageID } from '../../../social/enums';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Typography } from '../../../social/components/Typography/Typography';

type EndLiveStreamButtonProps = TouchableOpacityProps & {
  pageId?: PageID;
  componentId?: ComponentID;
};

function EndLiveStreamButton({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
}: EndLiveStreamButtonProps) {
  const elementId = ElementID.end_live_stream_button;
  const { accessibilityId, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });
  const styles = useStyles(themeStyles);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.button}
      testID={accessibilityId}
      {...props}
    >
      <Typography.BodyBold style={styles.label}>End live</Typography.BodyBold>
    </TouchableOpacity>
  );
}

export default EndLiveStreamButton;
