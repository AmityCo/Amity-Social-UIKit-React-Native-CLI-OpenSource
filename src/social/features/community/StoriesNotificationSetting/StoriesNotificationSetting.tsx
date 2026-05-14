import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller } from 'react-hook-form';
import { Typography } from '../../../../core/components/Typography/Typography';
import { Radio } from '../../../../core/components/Radio';
import Header from './components/Header';
import { RootStackParamList } from '../../../../core/routes/RouteParamList';
import { useStoriesNotificationSetting } from './hooks/useStoriesNotificationSetting';

export function StoriesNotificationSetting({
  community,
}: RootStackParamList['CommunityStoriesNotificationSetting']) {
  const {
    styles,
    isDirty,
    control,
    disabled,
    onSubmit,
    handleSubmit,
    notifications,
    accessibilityId,
  } = useStoriesNotificationSetting({ community });

  return (
    <SafeAreaView
      edges={['top']}
      testID={accessibilityId}
      style={styles.container}
    >
      <Header
        disabled={disabled}
        isFormDirty={isDirty}
        onSave={handleSubmit(onSubmit)}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {notifications.map((item, index, list) => (
          <View key={item.radio.name}>
            <Controller
              control={control}
              name={item.radio.name}
              render={({ field: { onChange, value } }) => (
                <View>
                  <View style={styles.labelContainer}>
                    <Typography.BodyBold style={styles.colorBase}>
                      {item.title}
                    </Typography.BodyBold>
                    <Typography.Caption style={styles.colorBaseShade1}>
                      {item.description}
                    </Typography.Caption>
                  </View>
                  <Radio.Group value={value} onChange={onChange}>
                    {item.radio.items.map((radioItem) => (
                      <Radio.Option
                        key={radioItem.value}
                        value={radioItem.value}
                      >
                        <Radio.Label>
                          <Typography.Body>{radioItem.label}</Typography.Body>
                        </Radio.Label>
                        <Radio.Icon />
                      </Radio.Option>
                    ))}
                  </Radio.Group>
                </View>
              )}
            />
            {index !== list.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
