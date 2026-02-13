import { Image, ImageURISource } from 'react-native';
import { defaultAvatarUri } from '../../core/assets';
import { useMemo } from 'react';
import useConfig from './useConfig';
import { IUIKitConfigOptions } from '../../core/types/config';
import { UiKitConfigKeys } from '../enums';
import { useDarkMode } from './useDarkMode';

export const useConfigImageUri = ({
  configPath,
  configKey,
}: {
  configPath: IUIKitConfigOptions;
  configKey: keyof UiKitConfigKeys;
}): ImageURISource => {
  const { getUiKitConfig } = useConfig();
  const { isDarkTheme } = useDarkMode();
  const configImageUri = useMemo(() => {
    if (!configPath || !configKey) return defaultAvatarUri;
    const fileUri = getUiKitConfig(configPath)?.[configKey] as string;
    if (!fileUri) return defaultAvatarUri;
    if (fileUri.includes('http')) return fileUri;
    let image: number | string = defaultAvatarUri;
    if (fileUri === 'mute.png') {
      image = require('../../core/assets/configs/mute.png');
    }
    if (fileUri === 'unmute.png') {
      image = require('../../core/assets/configs/unmute.png');
    }
    if (fileUri === 'aspect_ratio.png') {
      image = require('../../core/assets/configs/aspect_ratio.png');
    }
    if (fileUri === 'hyperlink_button.png') {
      image = require('../../core/assets/configs/hyperlink_button.png');
    }
    if (fileUri === 'searchButtonIcon') {
      image = require('../../core/assets/configs/search.png');
    }
    if (fileUri === 'postCreationIcon') {
      image = require('../../core/assets/configs/plus.png');
    }
    if (fileUri === 'search') {
      image = require('../../core/assets/configs/search.png');
    }
    if (fileUri === 'clear') {
      image = require('../../core/assets/configs/clear.png');
    }
    if (fileUri === 'lockIcon') {
      image = require('../../core/assets/configs/lockIcon.png');
    }
    if (fileUri === 'officialBadgeIcon') {
      image = require('../../core/assets/configs/officialBadgeIcon.png');
    }
    if (fileUri === 'emptyFeedIcon') {
      image = isDarkTheme
        ? require('../../core/assets/configs/emptyFeedIcon_dark.png')
        : require('../../core/assets/configs/emptyFeedIcon_light.png');
    }
    if (fileUri === 'exploreCommunityIcon') {
      image = require('../../core/assets/configs/exploreCommunityIcon.png');
    }
    if (fileUri === 'badgeIcon') {
      image = require('../../core/assets/configs/badgeIcon.png');
    }
    if (fileUri === 'backButtonIcon') {
      image = require('../../core/assets/configs/backButtonIcon.png');
    }
    if (fileUri === 'menuIcon') {
      image = require('../../core/assets/configs/menuIcon.png');
    }
    if (fileUri === 'likeButtonIcon') {
      image = require('../../core/assets/configs/likeButtonIcon.png');
    }
    if (fileUri === 'commentButtonIcon') {
      image = require('../../core/assets/configs/commentButtonIcon.png');
    }
    if (fileUri === 'shareButtonIcon') {
      image = require('../../core/assets/configs/shareButtonIcon.png');
    }
    if (fileUri === 'create_post_button') {
      image = require('../../core/assets/configs/create_post_button.png');
    }
    if (fileUri === 'create_story_button') {
      image = require('../../core/assets/configs/create_story_button.png');
    }
    if (fileUri === 'create_poll_button') {
      image = require('../../core/assets/configs/create_poll_button.png');
    }
    if (fileUri === 'create_livestream_button') {
      image = require('../../core/assets/configs/create_livestream_button.png');
    }
    if (fileUri === 'close_button') {
      image = isDarkTheme
        ? require('../../core/assets/configs/close_button_dark.png')
        : require('../../core/assets/configs/close_button_light.png');
    }
    if (fileUri === 'image_button') {
      image = require('../../core/assets/configs/image_button.png');
    }
    if (fileUri === 'video_button') {
      image = require('../../core/assets/configs/video_button.png');
    }
    if (fileUri === 'camera_button') {
      image = require('../../core/assets/configs/camera_button.png');
    }
    if (fileUri === 'file_button') {
      image = require('../../core/assets/configs/file_button.png');
    }
    if (fileUri === 'empty_list_icon') {
      image = require('../../core/assets/configs/empty_list_icon.png');
    }
    if (fileUri === 'search_light') {
      image = require('../../core/assets/configs/search_light.png');
    }
    if (typeof image === 'number') {
      return Image.resolveAssetSource(image)?.uri ?? defaultAvatarUri;
    }
    return image;
  }, [configPath, configKey, getUiKitConfig, isDarkTheme]);
  return { uri: configImageUri };
};
