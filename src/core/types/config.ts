import uikit_config from '../../../uikit.config.json';

export type IConfigRaw = typeof uikit_config;

export interface UIKitElementConfig {
  // Common fields
  text?: string;
  image?: string;
  icon?: string;
  background_color?: string;
  theme?: Record<string, string>;

  // Story / camera fields
  resolution?: string;
  close_icon?: string;
  back_icon?: string;
  aspect_ratio_icon?: string;
  hyperlink_button_icon?: string;
  hyper_link_icon?: string;
  share_icon?: string;
  hide_avatar?: boolean;
  progress_color?: string[];
  overflow_menu_icon?: string;
  impression_icon?: string;
  comment_icon?: string;
  reaction_icon?: string;
  create_new_story_icon?: string;
  mute_icon?: string;
  unmute_icon?: string;

  // Edit comment / hyperlink config fields
  cancel_icon?: string;
  cancel_button_text?: string;
  save_icon?: string;
  save_button_text?: string;
  done_icon?: string;
  done_button_text?: string;
}

export interface IUIKitConfig {
  preferred_theme: 'dark' | 'light' | 'default';
  globalTheme: Record<string, any>;
  excludes: string[];
  getConfig: (id: string) => any;
  getDefaultConfig: (id: string) => any;
  getUiKitConfig?: ({
    element,
    page,
    component,
  }: IUIKitConfigOptions) => UIKitElementConfig | undefined;
}

export interface ITheme {
  light?: {
    primary_color?: string;
    secondary_color?: string;
    base_color?: string;
    base_shade1_color?: string;
    base_shade2_color?: string;
    base_shade3_color?: string;
    base_shade4_color?: string;
    alert_color?: string;
    background_color?: string;
  };
  dark?: {
    primary_color?: string;
    secondary_color?: string;
    base_color?: string;
    base_shade1_color?: string;
    base_shade2_color?: string;
    base_shade3_color?: string;
    base_shade4_color?: string;
    alert_color?: string;
    background_color?: string;
  };
}

export interface IUIKitConfigOptions {
  page?: string;
  component?: string;
  element?: string;
}
