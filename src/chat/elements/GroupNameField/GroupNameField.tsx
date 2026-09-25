// GroupNameField element — a labeled, character-counted text field for the group
// chat name, wrapping the Input.Text atom.
//
// A group name is one line of text but may be longer than the field is wide.
// `multiLine` is what lets it wrap to a second line instead of scrolling
// sideways out of sight, and `blockNewLine` then refuses Enter so it stays one
// line of *text*: without the second prop the field grew a line per return press
// and pushed the rest of the form off screen. blockNewLine strips on change
// rather than on key press, so it also catches a pasted multi-line string, which
// no key handler would see and which Android does not reliably report as a
// cancellable Enter. maxLength bounds how far the field can grow.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { Input } from '../../../core/design/atoms/Input';
import { useString } from '../../../core/localization';
import { useStyles } from './styles';

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
        blockNewLine
      />
    </View>
  );
}
