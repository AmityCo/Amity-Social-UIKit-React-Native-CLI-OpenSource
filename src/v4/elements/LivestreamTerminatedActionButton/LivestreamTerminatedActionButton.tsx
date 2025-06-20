import React, { FC, memo } from 'react';
import { ComponentID, ElementID, PageID } from '../../enum/enumUIKitID';
import { useAmityElement } from '../../hook';
import { Button, BUTTON_SIZE } from '../../component/Button/Button';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes/RouteParamList';
import { useNavigation } from '@react-navigation/native';

type LivestreamTerminatedActionButtonType = {
  pageId?: PageID;
  componentId?: ComponentID;
};

const LivestreamTerminatedActionButton: FC<
  LivestreamTerminatedActionButtonType
> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}) => {
  const { accessibilityId, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.livestream_terminated_action_button,
  });

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Button
      type="primary"
      testID={accessibilityId}
      themeStyle={themeStyles}
      size={BUTTON_SIZE.LARGE}
      onPress={() => navigation.goBack()}
    >
      OK
    </Button>
  );
};

export default memo(LivestreamTerminatedActionButton);
