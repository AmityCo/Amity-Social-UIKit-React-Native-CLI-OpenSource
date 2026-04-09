import { useStyles } from './styles';
import { TextProps } from 'react-native';
import { useAmityElement } from '../../hooks';
import { Typography } from '../../../core/components/Typography/Typography';
import { ComponentID, ElementID, PageID } from '../../enums/enumUIKitID';

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
      {config?.text}
    </Typography.Caption>
  );
}

export default FormDescription;
