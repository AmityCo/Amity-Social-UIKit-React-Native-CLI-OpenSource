import React from 'react';
import { useStyle } from './styles';
import { useAmityElement } from '../../hook';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { PageID, ComponentID, ElementID } from '../../enum';
import { Typography } from '../../component/Typography/Typography';
import { livestream } from '../../assets/icons';
import { IconElement } from '../../PublicApi/Elements/IconElement';

type CreateLivestreamButtonProps = TouchableOpacityProps & {
  pageId?: PageID;
  componentId?: ComponentID;
};

const CreateLivestreamButton = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
}: CreateLivestreamButtonProps) => {
  const styles = useStyle();
  const { config, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.create_livestream_button,
  });

  return (
    <TouchableOpacity
      {...props}
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
      style={[styles.container, props.style]}
    >
      <IconElement
        configIcon={config.image as string}
        configIconStyle={styles.icon}
        defaultIcon={livestream()}
        defaultIconStyle={styles.icon}
      />
      <Typography.BodyBold>{(config.text as string) ?? ''}</Typography.BodyBold>
    </TouchableOpacity>
  );
};

export default CreateLivestreamButton;
