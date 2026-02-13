import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useStyle } from './styles';
import { MyMD3Theme } from '~/core/providers/AmityUIKitProvider';
import { useAmityElement, useConfigImageUri } from '../../../../social/hooks';
import { PageID, ComponentID, ElementID } from '../../../../social/enums';

interface ButtonWithIconElementProps {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId: ElementID;
  configTheme?: MyMD3Theme;
  onClick?: () => void;
}

const ButtonWithIconElement = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId,
  onClick,
}: ButtonWithIconElementProps) => {
  const icon = useConfigImageUri({
    configPath: {
      page: pageId,
      component: componentId,
      element: elementId,
    },
    configKey: 'image',
  });

  const { config, themeStyles, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const styles = useStyle(themeStyles);

  return (
    <TouchableOpacity
      onPress={onClick}
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
    >
      <View style={styles.container}>
        <Image source={icon} style={styles.icon} />
        <Text style={styles.label}>{(config?.text as string) || ''}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ButtonWithIconElement;
