import React, { Fragment } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from './components/Header';
import { CheckBox } from '~/v4/component/CheckBox';
import { Typography } from '~/v4/component/Typography/Typography';
import Button, { BUTTON_SIZE } from '~/v4/component/Button/Button';
import Avatar from '~/v4/component/Avatar';
import CategoryChip from '~/v4/component/CategoryChip/CategoryChip';
import { Controller } from 'react-hook-form';
import useAddCategory from './hooks/useAddCategory';
import MemberSkeleton from '../shared/components/MemberSkeleton';

const AddCategory = () => {
  const {
    categories,
    fetchNextPage,
    hasNextPage,
    handleSubmit,
    isFetchingNextPage,
    isDirty,
    control,
    isSubmitting,
    onSubmit,
    isValid,
    styles,
    theme,
    isLoading,
  } = useAddCategory();

  return (
    <SafeAreaView style={styles.container}>
      <Controller
        control={control}
        name="categories"
        render={({ field: { onChange, value } }) => (
          <Fragment>
            <Header bordered total={categories.length} count={value.length} />
            {value.length > 0 && (
              <View style={styles.selectedCategoriesContainer}>
                {value.map((selectedCategory) => (
                  <CategoryChip
                    category={selectedCategory}
                    key={selectedCategory.categoryId}
                    onPress={() =>
                      onChange(
                        value.filter(
                          (cat) =>
                            cat.categoryId !== selectedCategory.categoryId
                        )
                      )
                    }
                  />
                ))}
              </View>
            )}
            {isLoading && (
              <View style={styles.skeletonContainer}>
                <MemberSkeleton />
                <MemberSkeleton />
                <MemberSkeleton />
              </View>
            )}
            <CheckBox.Group<Amity.Category>
              value={value}
              onChange={onChange}
              extractKey={(item) => item.categoryId}
              select={(list, option) =>
                !!list.find((cat) => cat.categoryId === option.categoryId)
              }
            >
              <FlatList<Amity.Category>
                data={categories}
                keyExtractor={(item) => item.categoryId}
                contentContainerStyle={styles.categoryContainer}
                onEndReached={() => {
                  if (hasNextPage && !isFetchingNextPage) fetchNextPage?.();
                }}
                ListFooterComponent={
                  isFetchingNextPage ? (
                    <View style={styles.skeletonContainer}>
                      <MemberSkeleton />
                      <MemberSkeleton />
                      <MemberSkeleton />
                    </View>
                  ) : null
                }
                renderItem={({ item }) => (
                  <CheckBox.Option<Amity.Category>
                    value={item}
                    style={() => styles.categoryOption}
                  >
                    <CheckBox.Label style={styles.categoryLabel}>
                      <Avatar.Category
                        uri={item.avatar?.fileUrl}
                        imageStyle={styles.categoryImage}
                        iconProps={{ width: 40, height: 40 }}
                      />
                      <Typography.BodyBold
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={styles.categoryLabelText}
                      >
                        {item.name}
                      </Typography.BodyBold>
                    </CheckBox.Label>
                    <CheckBox.Icon />
                  </CheckBox.Option>
                )}
              />
            </CheckBox.Group>
          </Fragment>
        )}
      />
      <View style={styles.submitButtonContainer}>
        <Button
          type="primary"
          themeStyle={theme}
          size={BUTTON_SIZE.LARGE}
          onPress={handleSubmit(onSubmit)}
          disabled={!isDirty || !isValid || isSubmitting}
        >
          Add category
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default AddCategory;
