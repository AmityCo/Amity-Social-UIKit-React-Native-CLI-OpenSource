import React, { createContext, useContext, ReactNode } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Typography } from '~/v4/component/Typography/Typography';
import { useStyles } from './styles';
import { capitalize } from '~/v4/utils';
import { ComponentID, ElementID, PageID } from '~/v4/enum';
import { useAmityElement } from '~/v4/hook';

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
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
  value: T;
  type?: 'title' | 'body';
  icon?: string;
};

function Tab<T>({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.WildCardElement,
  value,
  children,
  type = 'title',
  icon,
  ...props
}: TabProps<T>) {
  const { styles } = useStyles();
  const { activeTab, onChangeTab, variant } = useTabContext<T>();
  const { config } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const isActive = activeTab === value;
  const Label =
    type === 'body'
      ? Typography.BodyBold
      : isActive
      ? Typography.TitleBold
      : Typography.Title;

  const iconToDisplay = variant === 'icon' ? icon || config?.image : null;
  const iconString = typeof iconToDisplay === 'string' ? iconToDisplay : null;

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
      {variant === 'icon' && iconString ? (
        <SvgXml xml={iconString} width={24} height={24} />
      ) : (
        <Label
          style={[
            styles[`${variant}TabText`],
            isActive && [styles[`active${capitalize(variant)}TabText`]],
          ]}
        >
          {children}
        </Label>
      )}
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
