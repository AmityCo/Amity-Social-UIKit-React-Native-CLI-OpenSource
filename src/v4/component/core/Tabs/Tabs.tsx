import React, { createContext, useContext, ReactNode } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
} from 'react-native';
import { Typography } from '~/v4/component/Typography/Typography';
import { useStyles } from './styles';
import { capitalize } from '~/v4/utils';

type TabsContextType<T> = {
  variant: 'chip' | 'underline' | 'icon';
  activeTab: T;
  onChangeTab: (val: T) => void;
};

const TabContext = createContext<TabsContextType<any> | null>(null);

function useTabContext<T>() {
  const context = useContext<TabsContextType<T> | null>(TabContext);
  return context;
}

type TabsProps<T extends string> = TabsContextType<T> & {
  children: ReactNode;
};

function Tabs<T extends string>({
  variant = 'chip',
  activeTab,
  onChangeTab,
  children,
}: TabsProps<T>) {
  return (
    <TabContext.Provider value={{ variant, activeTab, onChangeTab }}>
      {children}
    </TabContext.Provider>
  );
}

type TabListProps = ViewProps;

function TabList({ children, style, ...props }: TabListProps) {
  const { styles } = useStyles();
  const { variant } = useTabContext();

  return (
    <View {...props} style={[styles[`${variant}TabList`], style]}>
      {children}
    </View>
  );
}

type TabProps<T> = TouchableOpacityProps & {
  value: T;
  type?: 'title' | 'body';
};

function Tab<T>({ value, children, type = 'title', ...props }: TabProps<T>) {
  const { styles } = useStyles();
  const { activeTab, onChangeTab, variant } = useTabContext<T>();

  const isActive = activeTab === value;
  const Label =
    type === 'body'
      ? Typography.BodyBold
      : isActive
      ? Typography.TitleBold
      : Typography.Title;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onChangeTab(value)}
      style={[
        styles[`${variant}Tab`],
        isActive && [styles[`active${capitalize(variant)}Tab`]],
      ]}
      {...props}
    >
      <Label
        style={[
          styles[`${variant}TabText`],
          isActive && [styles[`active${capitalize(variant)}TabText`]],
        ]}
      >
        {children}
      </Label>
    </TouchableOpacity>
  );
}

type TabContentProps<T> = {
  value: T;
  children: ReactNode;
};

function TabContent<T>({ value, children }: TabContentProps<T>) {
  const { activeTab } = useTabContext<T>();

  const isActive = activeTab === value;

  return isActive ? children : null;
}

Tabs.Tab = Tab;

Tabs.List = TabList;

Tabs.Content = TabContent;

export default Tabs;
