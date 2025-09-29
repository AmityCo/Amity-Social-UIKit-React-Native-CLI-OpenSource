import React, { useState } from 'react';
import {
  Image,
  ImageProps,
  ImageStyle,
  StyleProp,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { SvgXml, XmlProps } from 'react-native-svg';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';
import { category } from '~/v4/assets/icons';
import { Typography } from '../Typography/Typography';
import { useStyles } from './styles';
import ModeratorBadge from '~/v4/elements/ModeratorBadge';
import { isModerator } from '~/v4/utils/permissions';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ComponentID, ElementID, PageID } from '~/v4/enum';
import { useAmityElement } from '~/v4/hook';

type AvatarProps = {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
  uri?: string;
  imageProps: Omit<ImageProps, 'source'>;
  iconProps?: XmlProps;
  userAvatarProps?: {
    userName?: string;
    userId?: string;
    style?: StyleProp<ImageStyle>;
    roles?: string[];
    shouldRedirectToUserProfile?: boolean;
    onOpenImageViewer?: () => void;
  };
};

function Avatar({
  uri,
  imageProps,
  iconProps,
  userAvatarProps,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.user_avatar,
}: AvatarProps) {
  const { styles } = useStyles();
  const [imageError, setImageError] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  return uri && !imageError ? (
    <TouchableOpacity
      testID={accessibilityId}
      style={imageProps.style}
      activeOpacity={0.7}
      onPress={() => {
        if (userAvatarProps?.onOpenImageViewer) {
          userAvatarProps.onOpenImageViewer();
        }
        if (userAvatarProps?.shouldRedirectToUserProfile) {
          navigation.navigate('UserProfile', {
            userId: userAvatarProps?.userId,
          });
        }
      }}
    >
      <Image
        source={{ uri }}
        {...imageProps}
        onError={() => setImageError(true)}
      />
    </TouchableOpacity>
  ) : iconProps ? (
    <SvgXml {...iconProps} />
  ) : (
    <TouchableOpacity
      testID={accessibilityId}
      style={[styles.defaultUserAvatar, userAvatarProps.style]}
      activeOpacity={0.7}
      onPress={() => {
        if (userAvatarProps?.shouldRedirectToUserProfile) {
          navigation.navigate('UserProfile', {
            userId: userAvatarProps?.userId,
          });
        }
      }}
    >
      <Typography.Body style={styles.firstChar}>
        {userAvatarProps.userName?.trim()?.charAt(0).toUpperCase()}
      </Typography.Body>
      {userAvatarProps.roles && isModerator(userAvatarProps.roles) && (
        <ModeratorBadge style={styles.moderatorBadge} />
      )}
    </TouchableOpacity>
  );
}

type CategoryAvatarProps = {
  uri?: string;
  imageStyle?: StyleProp<ImageStyle>;
  iconProps?: Pick<XmlProps, 'width' | 'height'>;
};

function CategoryAvatar({
  uri,
  imageStyle,
  iconProps: $iconProps,
}: CategoryAvatarProps) {
  const theme = useTheme<MyMD3Theme>();
  return (
    <Avatar
      uri={uri}
      imageProps={{
        style: imageStyle,
        accessibilityLabel: 'Category Avatar',
      }}
      iconProps={{
        xml: category(),
        color: theme.colors.primaryShade2,
        ...$iconProps,
      }}
    />
  );
}

type UserAvatarProps = {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
  uri?: string;
  userId?: string;
  roles?: string[];
  userName?: string;
  imageStyle?: StyleProp<ImageStyle>;
  shouldRedirectToUserProfile?: boolean;
  onOpenImageViewer?: () => void;
};

function UserAvatar({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.WildCardElement,
  uri,
  roles,
  userId,
  userName,
  imageStyle,
  shouldRedirectToUserProfile,
  onOpenImageViewer,
}: UserAvatarProps) {
  return (
    <Avatar
      pageId={pageId}
      componentId={componentId}
      elementId={elementId}
      uri={uri}
      userAvatarProps={{
        roles,
        userId,
        userName,
        style: imageStyle,
        shouldRedirectToUserProfile,
        onOpenImageViewer,
      }}
      imageProps={{
        style: imageStyle,
        accessibilityLabel: `${userName ?? 'User'} Avatar`,
      }}
    />
  );
}

Avatar.Category = CategoryAvatar;

Avatar.User = UserAvatar;

export default Avatar;
