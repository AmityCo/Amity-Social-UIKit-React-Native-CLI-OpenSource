import { useMemo } from 'react';
import { IUIKitConfigOptions } from '../../v4/types/config.interface';
import useConfig from './useConfig';
import { UiKitConfigKeys } from '../../v4/enums/enumUIKitID';

type UIKitConfigT = IUIKitConfigOptions & { keys: (keyof UiKitConfigKeys)[] };

export const useUiKitConfig = ({ keys, ...rest }: UIKitConfigT) => {
  const { getUiKitConfig } = useConfig();
  const config = useMemo(() => {
    return keys.map((key) => {
      return getUiKitConfig(rest)?.[key];
    });
  }, [getUiKitConfig, keys, rest]);
  return config;
};
