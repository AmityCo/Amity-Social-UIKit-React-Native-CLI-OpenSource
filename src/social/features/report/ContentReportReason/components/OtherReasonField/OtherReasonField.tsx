import { TextInput, View } from 'react-native';
import { Typography } from '../../../../../../core/components/Typography/Typography';
import { useStyles } from './styles';

type OtherReasonFieldProps = {
  title: string;
  optionalLabel: string;
  placeholder: string;
  value: string;
  maxLength: number;
  disabled?: boolean;
  onChangeText: (text: string) => void;
};

export function OtherReasonField({
  title,
  optionalLabel,
  placeholder,
  value,
  maxLength,
  disabled,
  onChangeText,
}: OtherReasonFieldProps) {
  const { styles, theme } = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.labelContainer}>
          <Typography.TitleBold style={styles.title}>
            {title}{' '}
            <Typography.Caption style={styles.optional}>
              {optionalLabel}
            </Typography.Caption>
          </Typography.TitleBold>
          <Typography.Caption style={styles.counter}>
            {value.length}/{maxLength}
          </Typography.Caption>
        </View>
        <TextInput
          multiline
          value={value}
          maxLength={maxLength}
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.baseShade3}
          returnKeyType="done"
          submitBehavior="blurAndSubmit"
          onChangeText={onChangeText}
          accessibilityLabel={title}
          style={[styles.input, disabled && styles.inputDisabled]}
        />
      </View>
    </View>
  );
}
