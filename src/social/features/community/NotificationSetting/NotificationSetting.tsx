import { Switch, View } from 'react-native';
import { Controller } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../../../core/components/Typography/Typography';
import Action from '../shared/elements/Action';
import Header from './components/Header';
import { RootStackParamList } from '../../../../core/routes/RouteParamList';
import { useNotificationSetting } from './hooks/useNotificationSetting';

export type NotificationSettingProps =
  RootStackParamList['CommunityNotificationSetting'];

export function NotificationSetting({ community }: NotificationSettingProps) {
  const {
    styles,
    theme,
    control,
    accessibilityId,
    isEnabled,
    isPending,
    handleToggle,
    notificationActions,
  } = useNotificationSetting({ community });

  return (
    <SafeAreaView
      edges={['top']}
      testID={accessibilityId}
      style={styles.container}
    >
      <Header />
      <View style={styles.switchContainer}>
        <View style={styles.labelContainer}>
          <Typography.BodyBold style={styles.colorBase}>
            Allow notifications
          </Typography.BodyBold>
          <Typography.Caption style={styles.colorBaseShade1}>
            Turn on to receive push notifications from this community.
          </Typography.Caption>
        </View>
        <Controller
          name="isEnabled"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Switch
              value={value}
              onValueChange={(val) => {
                onChange(val);
                handleToggle(val);
              }}
              disabled={isPending}
              thumbColor={theme.colors.background}
              ios_backgroundColor={theme.colors.baseShade3}
              trackColor={{
                true: theme.colors.primary,
                false: theme.colors.baseShade3,
              }}
            />
          )}
        />
      </View>
      {isEnabled && (
        <>
          <View style={styles.divider} />
          {notificationActions.map((item) => (
            <Action key={item.label} {...item} />
          ))}
        </>
      )}
    </SafeAreaView>
  );
}
