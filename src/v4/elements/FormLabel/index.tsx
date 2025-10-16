import React from 'react';
import { useStyles } from './styles';
import { TextProps } from 'react-native';
import { useAmityElement } from '../../hook';
import { Typography } from '../../component/Typography/Typography';
import { ComponentID, ElementID, PageID } from '../../enum/enumUIKitID';

type FormLabelProps = Partial<TextProps> & {
  optional?: boolean;
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
};

function FormLabel({
  optional,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.WildCardElement,
  ...props
}: FormLabelProps) {
  const { isExcluded, accessibilityId, config, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });
  const styles = useStyles(themeStyles);

  if (isExcluded) return null;

  return (
    <Typography.TitleBold
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
      style={[styles.formLabel, props.style]}
      {...props}
    >
      {config?.text as string}{' '}
      {optional && (
        <Typography.Caption style={styles.optional}>
          (Optional)
        </Typography.Caption>
      )}
    </Typography.TitleBold>
  );
}

export default FormLabel;
