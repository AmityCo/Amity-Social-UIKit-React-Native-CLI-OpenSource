import React from 'react';
import { View, ScrollView } from 'react-native';
import { Controller } from 'react-hook-form';
import CoverImage from '../shared/components/CoverImageUpload';
import { ElementID, PageID } from '~/v4/enum';
import FormInput from '~/v4/component/FormInput';
import Categories from '../shared/components/Categories';
import Privacy from '../shared/components/Privacy';
import {
  MAX_COMMUNITY_DESCRIPTION_LENGTH,
  MAX_COMMUNITY_NAME_LENGTH,
} from '~/v4/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from './components/Header';
import { useEditCommunity } from './hooks/useEditCommunity';
import ActionButton from '~/v4/elements/ActionButton';

type EditCommunity = {
  community: Amity.Community;
};

function EditCommunity({ community }: EditCommunity) {
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
  } = useEditCommunity(community);

  return (
    <SafeAreaView style={styles.container}>
      <Header isFormDirty={isDirty} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Controller
          name="image"
          control={control}
          render={({ field: { onChange, value } }) => (
            <CoverImage
              value={value}
              onChange={onChange}
              progress={progress}
              openCamera={openCamera}
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
        </View>
      </ScrollView>
      <View style={styles.submitButtonContainer}>
        <ActionButton
          onPress={handleSubmit(onSubmit)}
          pageId={PageID.community_setup_page}
          elementId={ElementID.community_edit_button}
          disabled={!isDirty || !isValid || isSubmitting || progress > 0}
        />
      </View>
    </SafeAreaView>
  );
}

export default EditCommunity;
