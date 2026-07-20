// User row atom — ported from AmityUiKitWeb core/design/atoms/Input/User.
// A read-only identity row (title / username / description) with an optional
// trailing text action. Web's <button> action becomes an RN Pressable + Text.

import { Pressable, View, Text as RNText } from 'react-native';
import { useStyles } from './styles';

export type UserData = {
  userId: string;
  title: string;
  username?: string;
  description?: string;
  actionLabel?: string;
  disabled?: boolean;
};

export type UserProps = {
  user: UserData;
  onActionClick?: (user: UserData) => void;
};

export function User({ user, onActionClick }: UserProps) {
  const { styles } = useStyles(!!user.disabled);

  return (
    <View style={styles.user}>
      <View style={styles.texts}>
        <RNText style={styles.title} numberOfLines={1}>
          {user.title}
        </RNText>
        {user.username ? (
          <RNText style={styles.username} numberOfLines={1}>
            {user.username}
          </RNText>
        ) : null}
        {user.description ? (
          <RNText style={styles.description} numberOfLines={1}>
            {user.description}
          </RNText>
        ) : null}
      </View>
      {user.actionLabel ? (
        <Pressable
          disabled={user.disabled}
          accessibilityRole="button"
          onPress={() => onActionClick?.(user)}
        >
          <RNText style={styles.action}>{user.actionLabel}</RNText>
        </Pressable>
      ) : null}
    </View>
  );
}
