import React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { Typography } from '../../component/Typography/Typography';
import FormLabel from '../../elements/FormLabel';
import { ElementID, PageID, ComponentID } from '../../enum';
import { useStyles } from './styles';

type FormInputProps = TextInputProps & {
  pageId?: PageID;
  maxLength?: number;
  elementId?: ElementID;
  componentId?: ComponentID;
  optional?: boolean;
};

function FormInput({
  value,
  optional,
  maxLength,
  pageId = PageID.WildCardPage,
  elementId = ElementID.WildCardElement,
  componentId = ComponentID.WildCardComponent,
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
        style={styles.input}
        maxLength={maxLength}
        placeholderTextColor={theme.colors.baseShade3}
      />
    </View>
  );
}

export default FormInput;
