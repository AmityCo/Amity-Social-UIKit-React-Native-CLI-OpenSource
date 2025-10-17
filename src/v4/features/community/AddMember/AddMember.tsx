import React, { Fragment } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from './components/Header';
import { CheckBox } from '~/v4/component/core/CheckBox';
import { Typography } from '~/v4/component/Typography/Typography';
import Avatar from '~/v4/component/Avatar';
import { Controller } from 'react-hook-form';
import useAddMember from './hooks/useAddMember';
import SearchInput from '~/v4/component/SearchInput';
import { MemberChip } from '~/v4/component/MemberChip/MemberChip';
import MemberSkeleton from '../shared/components/MemberSkeleton';
import LimitCharacterSearch from '~/v4/component/LimitCharacterSearch';
import NoResult from '~/v4/component/NoResult';
import EmptyList from '~/v4/component/EmptyList';
import ActionButton from '~/v4/elements/ActionButton';

const AddMember = () => {
  const {
    collection,
    handleSubmit,
    isDirty,
    control,
    isSubmitting,
    onSubmit,
    isValid,
    styles,
    values,
  } = useAddMember();

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <Controller
        control={control}
        name="search"
        render={({ field: { value, onChange } }) => (
          <View style={styles.searchInputContainer}>
            <SearchInput
              inputProps={{
                value,
                onChangeText: onChange,
                placeholder: 'Search user',
              }}
            />
          </View>
        )}
      />
      <Controller
        control={control}
        name="users"
        render={({ field: { onChange, value } }) => (
          <Fragment>
            {value.length > 0 && (
              <View style={styles.selectedUsersContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.selectedUsersContentContainer}
                >
                  {value.map((selectedUser) => (
                    <MemberChip
                      member={selectedUser}
                      key={selectedUser.userId}
                      onPress={() =>
                        onChange(
                          value.filter(
                            (cat) => cat.userId !== selectedUser.userId
                          )
                        )
                      }
                    />
                  ))}
                </ScrollView>
              </View>
            )}
            {collection.isLoading && (
              <View style={styles.skeletonContainer}>
                <MemberSkeleton />
                <MemberSkeleton />
                <MemberSkeleton />
              </View>
            )}
            {values.search?.length > 0 &&
              values.search?.length < 3 &&
              !collection.isLoading &&
              !collection.isFetching && (
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.keyboardAvoidContainer}
                  keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
                >
                  <View style={styles.limitCharacterSearchContainer}>
                    <LimitCharacterSearch />
                  </View>
                </KeyboardAvoidingView>
              )}

            {values.search?.length > 0 &&
              collection.data.length === 0 &&
              !collection.isLoading &&
              !collection.isFetching && (
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.keyboardAvoidContainer}
                  keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
                >
                  <View style={styles.limitCharacterSearchContainer}>
                    <NoResult />
                  </View>
                </KeyboardAvoidingView>
              )}

            {values.search?.length === 0 &&
              collection.data.length === 0 &&
              !collection.isLoading &&
              !collection.isFetching && (
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.keyboardAvoidContainer}
                  keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
                >
                  <View style={styles.limitCharacterSearchContainer}>
                    <EmptyList />
                  </View>
                </KeyboardAvoidingView>
              )}
            <CheckBox.Group<Amity.User>
              value={value}
              onChange={onChange}
              extractKey={(item) => item.userId}
              select={(list, option) =>
                !!list.find((cat) => cat.userId === option.userId)
              }
            >
              <FlatList<Amity.User>
                data={collection.data}
                keyExtractor={(item) => item.userId}
                contentContainerStyle={styles.userContainer}
                onEndReached={() => {
                  if (collection.hasNextPage && !collection.isFetchingNextPage)
                    collection.fetchNextPage?.();
                }}
                ListFooterComponent={
                  collection.isFetchingNextPage ? (
                    <View style={styles.skeletonContainer}>
                      <MemberSkeleton />
                      <MemberSkeleton />
                      <MemberSkeleton />
                    </View>
                  ) : null
                }
                renderItem={({ item }) => (
                  <CheckBox.Option<Amity.User>
                    value={item}
                    style={() => styles.userOption}
                  >
                    <CheckBox.Label style={styles.userOptionLabel}>
                      <Avatar.User
                        uri={item.avatar?.fileUrl}
                        imageStyle={styles.userImage}
                        userName={item.displayName || item.userId}
                      />
                      <Typography.BodyBold
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={styles.userName}
                      >
                        {item.displayName || item.userId}
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
        <ActionButton
          label="Add Member"
          onPress={handleSubmit(onSubmit)}
          disabled={!isDirty || !isValid || isSubmitting}
        />
      </View>
    </SafeAreaView>
  );
};

export default AddMember;
