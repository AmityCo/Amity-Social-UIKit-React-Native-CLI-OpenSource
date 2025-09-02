import React from 'react';
import { View, ScrollView } from 'react-native';
import { Controller } from 'react-hook-form';
import CoverImage from '../shared/components/CoverImageUpload';
import { ElementID, PageID } from '~/v4/enum';
import FormInput from '~/v4/component/FormInput';
import Categories from '../shared/components/Categories';
import { AmityCommunityPrivacyEnum } from '../shared/types';
import Privacy from '../shared/components/Privacy';
import Members from './components/Members';
import {
  MAX_COMMUNITY_DESCRIPTION_LENGTH,
  MAX_COMMUNITY_NAME_LENGTH,
} from '~/v4/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from './components/Header';
import { useCreateCommunity } from './hooks/useCreateCommunity';
import CommunityCreateButton from '~/v4/elements/CommunityCreateButton';

function CreateCommunity() {
  const {
    control,
    isDirty,
    isSubmitting,
    isValid,
    handleSubmit,
    onSubmit,
    openCamera,
    openImageGallery,
    progress,
    styles,
    navigation,
    values,
  } = useCreateCommunity();

  return (
    <SafeAreaView style={styles.container}>
      <Header isFormDirty={isDirty} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Controller
          name="image"
          control={control}
          render={({ field: { onChange, value } }) => (
            <CoverImage
              progress={progress}
              openCamera={openCamera}
              value={value}
              onChange={onChange}
              openImageGallery={openImageGallery}
            />
          )}
        />
        <View style={styles.allInputContainer}>
          <Controller
            name="displayName"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                value={value}
                onBlur={onBlur}
                multiline={false}
                onChangeText={onChange}
                placeholder="Name your community"
                pageId={PageID.community_setup_page}
                maxLength={MAX_COMMUNITY_NAME_LENGTH}
                elementId={ElementID.community_name_title}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                optional
                value={value}
                onBlur={onBlur}
                multiline={true}
                onChangeText={onChange}
                placeholder="Enter description"
                pageId={PageID.community_setup_page}
                elementId={ElementID.community_about_title}
                maxLength={MAX_COMMUNITY_DESCRIPTION_LENGTH}
              />
            )}
          />
          <Controller
            name="categories"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Categories
                categories={value}
                onChange={onChange}
                goBack={navigation.goBack}
              />
            )}
          />
          <Controller
            name="privacy"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Privacy value={value} onChange={onChange} />
            )}
          />
          {values.privacy === AmityCommunityPrivacyEnum.PRIVATE && (
            <Controller
              name="members"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Members
                  value={value}
                  onChange={onChange}
                  goBack={navigation.goBack}
                />
              )}
            />
          )}
        </View>
      </ScrollView>
      <View style={styles.submitButtonContainer}>
        <CommunityCreateButton
          onPress={handleSubmit(onSubmit)}
          pageId={PageID.community_setup_page}
          disabled={!isDirty || !isValid || isSubmitting || progress > 0}
        />
      </View>
    </SafeAreaView>
  );
}

export default CreateCommunity;
