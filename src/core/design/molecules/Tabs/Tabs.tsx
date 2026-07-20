// Tabs molecule — ported from AmityUiKitWeb core/design/molecules/Tabs.
// A tab BAR that composes the Tab atom. Web react-aria Tabs/TabList/TabPanel
// → RN row of `Tab`. Selection (selectedKey/onSelectionChange) → active/onChange.
// The web TabPanel content rendering is intentionally omitted: this molecule is
// the bar only, and callers render the active panel themselves.

import { type ReactNode } from 'react';
import { View } from 'react-native';
import { Tab } from '../../atoms/Tab';
import { useStyles } from './styles';

export type TabsVariant = 'pill' | 'underlined' | 'icon';

export type TabItem = {
  value: string;
  label?: string;
  icon?: ReactNode;
  disabled?: boolean;
};

export type TabsProps = {
  variant?: TabsVariant;
  value: string;
  onChange: (value: string) => void;
  tabs: TabItem[];
};

export function Tabs({ variant = 'pill', value, onChange, tabs }: TabsProps) {
  const { styles } = useStyles(variant);

  return (
    <View style={styles.tabList} accessibilityRole="tablist">
      {tabs.map((tab) => (
        <Tab
          key={tab.value}
          variant={variant}
          label={tab.label}
          icon={tab.icon}
          active={tab.value === value}
          disabled={tab.disabled}
          onPress={() => onChange(tab.value)}
        />
      ))}
    </View>
  );
}
