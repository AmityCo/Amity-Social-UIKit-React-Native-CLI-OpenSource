import { Image, ImageSourcePropType } from 'react-native';
import { defaultAvatarUri } from '../assets';
import { useMemo } from 'react';
import useConfig from './useConfig';
import { IUIKitConfigOptions } from '../types/config.interface';

export const useConfigImageUri = ({
  configPath,
  configKey,
}: {
  configPath: IUIKitConfigOptions;
  configKey: string;
}): ImageSourcePropType => {
  const { getUiKitConfig } = useConfig();
  const configImageUri = useMemo(() => {
    if (!configPath || !configKey) return;
    const fileUri = getUiKitConfig(configPath)?.[configKey] as string;
    if (!fileUri) return;
    if (fileUri.includes('http')) return fileUri;
    let image: number | string = defaultAvatarUri;
    if (fileUri === 'mute.png') {
      image = require('../configAssets/icons/mute.png');
    }
    if (fileUri === 'unmute.png') {
      image = require('../configAssets/icons/unmute.png');
    }
    if (typeof image === 'number') {
      return Image.resolveAssetSource(image)?.uri ?? defaultAvatarUri;
    }
    return image;
  }, [configPath, configKey, getUiKitConfig]);
  return { uri: configImageUri };
};
