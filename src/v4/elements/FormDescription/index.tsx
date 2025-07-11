import React from 'react';
import { useStyles } from './styles';
import { TextProps } from 'react-native';
import { useAmityElement } from '../../hook';
import { Typography } from '../../component/Typography/Typography';
import { ComponentID, ElementID, PageID } from '../../enum/enumUIKitID';

type FormDescriptionProps = Partial<TextProps> & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
};

function FormDescription({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.WildCardElement,
  ...props
}: FormDescriptionProps) {
  const { isExcluded, accessibilityId, config, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });
  const styles = useStyles(themeStyles);

  if (isExcluded) return null;

  return (
    <Typography.Caption
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
      style={[styles.formDescription, props.style]}
      {...props}
    >
      {config?.text as string}
    </Typography.Caption>
  );
}

export default FormDescription;
