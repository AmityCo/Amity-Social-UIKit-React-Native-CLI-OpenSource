import { useContext } from 'react';
import { ConfigContext } from '../../core/providers/ConfigProvider';
import { IUIKitConfigOptions } from '../../core/types/config';

interface IUIKitConfig {
  preferred_theme: 'light' | 'dark' | 'default';
  globalTheme: Record<string, any>;
  excludes: string[];
  getConfig: (key: string) => any;
  getDefaultConfig: (key: string) => any;
  getUiKitConfig: (
    arg: IUIKitConfigOptions
  ) => Record<string, string | string[] | Record<string, string>> | null;
}
const useConfig = (): IUIKitConfig => {
  const {
    preferred_theme,
    globalTheme,
    excludes,
    getConfig,
    getUiKitConfig,
    getDefaultConfig,
  } = useContext(ConfigContext);

  return {
    preferred_theme,
    globalTheme,
    excludes,
    getConfig,
    getUiKitConfig,
    getDefaultConfig,
  };
};

export default useConfig;
