import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Controller } from 'react-hook-form';
import { TopBar, ImageUpload } from './components';
import { useCreateProfile } from './hooks';
import FormInput from '../../../components/FormInput';
import { CHARACTER_LIMIT } from '../../../../core/constants';
import { ElementID, PageID } from '../../../enums';
import ActionButton from '../../../elements/ActionButton';

export type CreateProfileProps = {
  /**
   * The userId to create / sign in as. The profile is created on the network
   * the first time this user logs in. Required because the page performs the
   * real (signed-in) login on save.
   */
  userId: string;
  /**
   * Optional auth token for the signed-in login when the network uses secure
   * mode. Mirrors `authToken` on AmityUiKitProvider.
   */
  authToken?: string;
  /**
   * Optional remote avatar URL supplied by the host. Shown as the default
   * avatar when the user hasn't picked a photo, and uploaded as the avatar on
   * save (a locally picked photo takes priority). Requires the network's
   * "upload image from URL" feature to be enabled.
   */
  defaultAvatarImageUrl?: string;
  /**
   * Fired after the profile is successfully created and the user is signed in.
   * Receives the created userId and the chosen displayName. The host decides
   * what to render next (e.g. swap to the main UIKit / redirect to newsfeed).
   */
  onCreated?: (user: { userId: string; displayName: string }) => void;
  /**
   * Fired when the user dismisses the create-profile flow without creating.
   */
  onCancel?: () => void;
};

export function CreateProfile({
  userId,
  authToken,
  defaultAvatarImageUrl,
  onCreated,
  onCancel,
}: CreateProfileProps) {
  const {
    styles,
    control,
    onSubmit,
    isValid,
    isSubmitting,
    handleSubmit,
    accessibilityId,
  } = useCreateProfile({ userId, authToken, defaultAvatarImageUrl, onCreated });

  return (
    <SafeAreaView testID={accessibilityId} style={styles.container}>
      <TopBar onCancel={onCancel} disabled={isSubmitting} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Controller
            name="image"
            control={control}
            render={({ field: { onChange, value } }) => (
              <ImageUpload
                value={value}
                onChange={onChange}
                disabled={isSubmitting}
                defaultImageUrl={defaultAvatarImageUrl}
              />
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
                  editable={!isSubmitting}
                  onChangeText={onChange}
                  placeholder="Username"
                  pageId={PageID.create_user_profile_page}
                  maxLength={CHARACTER_LIMIT.USER_DISPLAY_NAME}
                  elementId={ElementID.user_display_name_title}
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
                  editable={!isSubmitting}
                  onChangeText={onChange}
                  placeholder="Write something about yourself"
                  pageId={PageID.create_user_profile_page}
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
            pageId={PageID.create_user_profile_page}
            elementId={ElementID.create_user_profile_button}
            disabled={!isValid || isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
