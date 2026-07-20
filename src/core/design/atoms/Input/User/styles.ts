import { StyleSheet } from 'react-native';
import { useToken, type ColorTokenRef } from '../../../theme/useToken';
import { AmityColorToken } from '../../../tokens/amity-color-tokens';

// User row has only default / disabled states.
const TITLE: Record<'default' | 'disabled', ColorTokenRef> = {
  default: AmityColorToken.TextInputUserInputTitleDefault,
  disabled: AmityColorToken.TextInputUserInputTitleDisabled,
};
const USERNAME: Record<'default' | 'disabled', ColorTokenRef> = {
  default: AmityColorToken.TextInputUserInputUserNameDefault,
  disabled: AmityColorToken.TextInputUserInputUserNameDisabled,
};
const DESCRIPTION: Record<'default' | 'disabled', ColorTokenRef> = {
  default: AmityColorToken.TextInputUserInputTextDescriptionDefault,
  disabled: AmityColorToken.TextInputUserInputTextDescriptionDisabled,
};
const ACTION: Record<'default' | 'disabled', ColorTokenRef> = {
  default: AmityColorToken.TextInputUserInputActionDefault,
  disabled: AmityColorToken.TextInputUserInputActionDisabled,
};

export const useStyles = (disabled: boolean) => {
  const token = useToken();
  const key = disabled ? 'disabled' : 'default';

  const styles = StyleSheet.create({
    user: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      width: '100%',
    },
    texts: {
      flexShrink: 1,
      gap: 2,
      minWidth: 0,
    },
    title: {
      fontSize: 15,
      fontWeight: '600',
      color: token(TITLE[key]),
    },
    username: {
      fontSize: 13,
      color: token(USERNAME[key]),
    },
    description: {
      fontSize: 13,
      color: token(DESCRIPTION[key]),
    },
    action: {
      flexShrink: 0,
      fontSize: 15,
      fontWeight: '600',
      color: token(ACTION[key]),
    },
  });

  return { styles, token };
};
