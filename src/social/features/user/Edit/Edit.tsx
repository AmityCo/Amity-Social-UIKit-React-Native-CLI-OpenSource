import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar, ImageUpload } from './components';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Controller } from 'react-hook-form';
import { useEditUser } from './hooks';
import FormInput from '../../../components/FormInput';
import { CHARACTER_LIMIT } from '../../../../core/constants';
import { ElementID, PageID } from '../../../enums';
import ActionButton from '../../../elements/ActionButton';

type EditUserProps = {
  userId: string;
};

export function EditUser({ userId }: EditUserProps) {
  const {
    user,
    styles,
    isDirty,
    isValid,
    control,
    onSubmit,
    isSubmitting,
    handleSubmit,
    accessibilityId,
    isDisplayNameDisabled,
  } = useEditUser(userId);

  return (
    <SafeAreaView testID={accessibilityId} style={styles.container}>
      <TopBar isFormDirty={isDirty} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Controller
            name="image"
            control={control}
            render={({ field: { onChange, value } }) => (
              <ImageUpload user={user} value={value} onChange={onChange} />
            )}
          />
          <View style={styles.inputContainer}>
            <Controller
              name="displayName"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  value={value}
                  onBlur={onBlur}
                  multiline={false}
                  onChangeText={onChange}
                  placeholder="Enter your display name"
                  pageId={PageID.edit_user_profile_page}
                  maxLength={CHARACTER_LIMIT.USER_DISPLAY_NAME}
                  elementId={ElementID.user_display_name_title}
                  editable={!isDisplayNameDisabled}
                />
              )}
            />
          </View>
          <View style={styles.inputContainer}>
            <Controller
              name="description"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  optional
                  multiline
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Enter your description"
                  pageId={PageID.edit_user_profile_page}
                  elementId={ElementID.user_about_title}
                  maxLength={CHARACTER_LIMIT.USER_DESCRIPTION}
                />
              )}
            />
          </View>
        </ScrollView>
        <View style={styles.submitButtonContainer}>
          <ActionButton
            onPress={handleSubmit(onSubmit)}
            pageId={PageID.edit_user_profile_page}
            elementId={ElementID.update_user_profile_button}
            disabled={!isDirty || !isValid || isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
