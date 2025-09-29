import React from 'react';
import { View } from 'react-native';
import { BackButton } from '~/v4/elements';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStyles } from './styles';
import MenuButton from '~/v4/elements/MenuButton';
import MenuAction from '~/v4/elements/MenuAction';
import { PageID } from '~/v4/enum';
import { useBottomSheet } from '~/redux/slices/bottomSheetSlice';
import { editIcon } from '~/v4/../svg/svg-xml-list';
import { blockUser as blockUserIcon } from '~/v4/assets/icons';
import { useTheme } from 'react-native-paper';
import { useUser } from '~/v4/hook/useUser';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';
import { useUserFlaggedByMeQuery } from '~/v4/hook/useFlagUserQuery';
import { report, unreport } from '~/v4/assets/icons';
import { useToast } from '~/v4/stores/slices/toast';
import { useUserBlock, useFollowUserStatus } from '~/v4/hook';

type HeaderProps = {
  pageId?: PageID;
  userId: string;
};

function Header({ pageId = PageID.WildCardPage, userId }: HeaderProps) {
  const { styles } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { openBottomSheet, closeBottomSheet } = useBottomSheet();
  const theme = useTheme() as MyMD3Theme;

  const user = useUser(userId);
  const { showToast } = useToast();
  const { followStatus } = useFollowUserStatus({
    userId,
    enabled: !!userId,
  });
  const { blockUser, unblockUser } = useUserBlock(userId);

  const isMyProfile = !followStatus;
  const isBlocked = followStatus === 'blocked';

  const { isFlaggedByMe, flagUser, unflagUser, refetch } =
    useUserFlaggedByMeQuery({
      userId: userId,
      enabled: !!userId,
    });

  const onPressEditProfile = () => {
    closeBottomSheet();
    navigation.navigate('EditProfile', {
      user: user,
    });
  };

  const flag = () => {
    flagUser(userId, {
      onSuccess: () => {
        refetch();
        showToast({
          type: 'success',
          message: 'User reported.',
        });
      },
      onError: () => {
        showToast({
          type: 'informative',
          message: 'Failed to report user. Please try again.',
        });
      },
    });
  };

  const unflag = () => {
    unflagUser(userId, {
      onSuccess: () => {
        refetch();
        showToast({
          type: 'success',
          message: 'User unreported.',
        });
      },
      onError: () => {
        showToast({
          type: 'informative',
          message: 'Failed to unreport user. Please try again.',
        });
      },
    });
  };

  return (
    <View style={styles.container}>
      <BackButton pageId={pageId} onPress={navigation.goBack} />
      <MenuButton
        testID="user_profile_header_menu_button"
        pageId={pageId}
        onPress={() => {
          openBottomSheet({
            content: (
              <>
                {isMyProfile ? (
                  <>
                    <MenuAction
                      label="Edit profile"
                      onPress={onPressEditProfile}
                      iconProps={{ xml: editIcon(theme.colors.base) }}
                      testID="edit-profile-button"
                      accessibilityLabel="Edit profile"
                    />
                    <MenuAction
                      label="Manage blocked users"
                      //TODO : implement manage blocked users screen
                      // onPress={}
                      iconProps={{ xml: blockUserIcon() }}
                      testID="manage-blocked-users-button"
                      accessibilityLabel="Manage blocked users"
                    />
                  </>
                ) : (
                  <>
                    {isFlaggedByMe ? (
                      <MenuAction
                        label="Unreport user"
                        testID="unreport-user-button"
                        iconProps={{ xml: unreport() }}
                        onPress={() => {
                          closeBottomSheet();
                          unflag();
                        }}
                      />
                    ) : (
                      <MenuAction
                        label="Report user"
                        testID="report-user-button"
                        iconProps={{ xml: report() }}
                        onPress={() => {
                          closeBottomSheet();
                          flag();
                        }}
                      />
                    )}
                    {isBlocked ? (
                      <MenuAction
                        label="Unblock user"
                        onPress={() => {
                          closeBottomSheet();
                          unblockUser(user?.displayName);
                        }}
                        iconProps={{ xml: blockUserIcon() }}
                        testID="unblock-user-button"
                        accessibilityLabel="Unblock user"
                      />
                    ) : (
                      <MenuAction
                        label="Block user"
                        onPress={() => {
                          closeBottomSheet();
                          blockUser(user?.displayName);
                        }}
                        iconProps={{ xml: blockUserIcon() }}
                        testID="block-user-button"
                        accessibilityLabel="Block user"
                      />
                    )}
                  </>
                )}
              </>
            ),
          });
        }}
      />
    </View>
  );
}

export default Header;
