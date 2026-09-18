// GroupNameField element — ported from AmityUiKitWeb chat/elements/GroupNameField.
// A labeled, character-counted text field for the group chat name. Wraps the
// Input.Text atom (the RN port of web's Input.Text), keeping web's prop API.
//
// A group name is single-line. Web passes no `multiLine` to Input.Text
// (so it renders a plain <input>, which cannot hold a newline); the RN port had
// added `multiLine`, which turned the field into a growing multiline TextInput
// that swallowed the return key and pushed the rest of the form off screen.
// Dropping `multiLine` restores web's shape, and `stripNewLines` on change also
// covers a *pasted* multi-line string — which no key handler would catch, and
// which Android does not reliably report as a cancellable Enter.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { Input } from '../../../core/design/atoms/Input';
import { useString } from '../../../core/localization';
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

// Keep the value on one line whatever route the text arrives by (typing, paste,
// autofill, a keyboard's own newline insertion).
function stripNewLines(text: string): string {
  return text.replace(/[\r\n]+/g, '');
}

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
        onChange={(text) => onChange(stripNewLines(text))}
        placeholder={placeholder ?? defaultPlaceholder}
        showCharacterCount
        maxLength={GROUP_NAME_MAX_LENGTH}
      />
    </View>
  );
}
