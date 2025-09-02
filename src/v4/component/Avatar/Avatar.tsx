import React, { useState } from 'react';
import { Image, ImageProps, ImageStyle, StyleProp, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SvgXml, XmlProps } from 'react-native-svg';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';
import { category } from '~/v4/assets/icons';
import { Typography } from '../Typography/Typography';
import { useStyles } from './styles';

type AvatarProps = {
  uri?: string;
  imageProps: Omit<ImageProps, 'source'>;
  iconProps?: XmlProps;
  userAvatarProps?: {
    userName?: string;
    style?: StyleProp<ImageStyle>;
  };
};

function Avatar({ uri, imageProps, iconProps, userAvatarProps }: AvatarProps) {
  const { styles } = useStyles();
  const [imageError, setImageError] = useState(false);

  return uri && !imageError ? (
    <Image
      source={{ uri }}
      {...imageProps}
      onError={() => setImageError(true)}
    />
  ) : iconProps ? (
    <SvgXml {...iconProps} />
  ) : (
    <View style={[styles.defaultUserAvatar, userAvatarProps.style]}>
      <Typography.Body style={styles.firstChar}>
        {userAvatarProps.userName?.trim()?.charAt(0).toUpperCase()}
      </Typography.Body>
    </View>
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
  uri?: string;
  imageStyle?: StyleProp<ImageStyle>;
  userName?: string;
};

function UserAvatar({ uri, imageStyle, userName }: UserAvatarProps) {
  return (
    <Avatar
      uri={uri}
      userAvatarProps={{
        userName,
        style: imageStyle,
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
