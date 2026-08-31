import { StyleSheet } from 'react-native';
import type { TabsVariant } from './Tabs';

// Bar-level layout only — the web Tabs.module.css tabList has no colors, so no
// color tokens are resolved here (all tab visuals live in the Tab atom).
// Geometry (web css rem→px ×16, matching SoT geometry.json → tabs):
//   pill:       gap 8  (tabs.pill.gap),      padding 12×16
//   underlined: gap 20 (tabs.underline.ios.itemGap), padding 0×16
//   icon:       gap 8,                        padding 0×16
export const useStyles = (variant: TabsVariant) => {
  const layout =
    variant === 'pill'
      ? { gap: 8, paddingVertical: 12, paddingHorizontal: 16 }
      : { gap: variant === 'underlined' ? 20 : 8, paddingHorizontal: 16 };

  const styles = StyleSheet.create({
    tabList: {
      flexDirection: 'row',
      alignItems: 'center',
      ...layout,
    },
  });

  return { styles };
};
