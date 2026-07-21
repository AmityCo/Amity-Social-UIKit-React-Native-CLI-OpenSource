// GroupNameField element — ported from AmityUiKitWeb chat/elements/GroupNameField.
// A labeled, character-counted text field for the group chat name. Wraps the
// Input.Text atom (the RN port of web's Input.Text), keeping web's prop API.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { Input } from '../../../../../core/design/atoms/Input';
import { useString } from '../../../../../core/localization';
import { useStyles } from './styles';

// Web imports GROUP_NAME_MAX_LENGTH from chat/constants (= 100). Inlined here to
// keep the port self-contained.
const GROUP_NAME_MAX_LENGTH = 100;

// 2. Types
export type GroupNameFieldProps = {
  value: string;
  optional?: boolean;
  required?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
};

// 3. Named function component
export function GroupNameField({
  value,
  onChange,
  optional = false,
  required = false,
  placeholder,
}: GroupNameFieldProps) {
  const { styles } = useStyles();

  const label = useString('amity_chat_group_name_label');
  const defaultPlaceholder = useString('amity_chat_group_name_placeholder');
  const optionalLabel = useString('amity_chat_group_name_optional');
  const requiredLabel = useString('amity_chat_group_name_required');

  const marker = required
    ? requiredLabel
    : optional
    ? optionalLabel
    : undefined;

  return (
    <View style={styles.container}>
      <Input.Text
        title={label}
        optionalLabel={marker}
        value={value}
        onChange={onChange}
        placeholder={placeholder ?? defaultPlaceholder}
        showCharacterCount
        maxLength={GROUP_NAME_MAX_LENGTH}
        multiLine
      />
    </View>
  );
}
