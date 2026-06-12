import { TextInput, TextInputProps, View } from 'react-native';
import { Typography } from '../../../core/components/Typography/Typography';
import FormLabel from '../../elements/FormLabel';
import { ElementID, PageID, ComponentID } from '../../enums';
import { useStyles } from './styles';

type FormInputProps = TextInputProps & {
  pageId?: PageID;
  maxLength?: number;
  elementId?: ElementID;
  componentId?: ComponentID;
  optional?: boolean;
};

/***
 * category: Form
 * component: Input
 */

function FormInput({
  value,
  optional,
  maxLength,
  pageId = PageID.WildCardPage,
  elementId = ElementID.WildCardElement,
  componentId = ComponentID.WildCardComponent,
  editable = true,
  ...props
}: FormInputProps) {
  const { styles, theme } = useStyles();

  return (
    <View style={styles.inputContainer}>
      <View style={styles.labelContainer}>
        <FormLabel
          optional={optional}
          pageId={pageId}
          elementId={elementId}
          componentId={componentId}
        />
        {maxLength && (
          <Typography.Caption style={styles.inputLength}>
            {value?.length}/{maxLength}
          </Typography.Caption>
        )}
      </View>
      <TextInput
        {...props}
        value={value}
        editable={editable}
        style={[styles.input, !editable && styles.inputDisabled]}
        maxLength={maxLength}
        placeholderTextColor={theme.colors.baseShade3}
      />
    </View>
  );
}

export default FormInput;
