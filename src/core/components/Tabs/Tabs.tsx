import { createContext, useContext, ReactNode } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
} from 'react-native';
import { Typography } from '../Typography/Typography';
import { useStyles } from './styles';
import { capitalize } from '../../../social/utils';
import { SvgXml, XmlProps } from 'react-native-svg';

type TabsContextType<T> = {
  variant: 'chip' | 'underline' | 'icon';
  activeTab: T;
  onChangeTab: (val: T) => void;
};

const defaultTabContext: TabsContextType<any> = {
  variant: 'chip',
  activeTab: '',
  onChangeTab: () => {},
};

const TabContext = createContext<TabsContextType<any>>(defaultTabContext);

function useTabContext<T>() {
  return useContext<TabsContextType<T>>(
    TabContext as React.Context<TabsContextType<T>>
  );
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
  const { styles: baseStyles } = useStyles();
  const styles = baseStyles as Record<string, any>;
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
  iconProps?: Pick<XmlProps, 'width' | 'height' | 'xml'>;
};

function Tab<T>({
  value,
  children,
  type = 'title',
  iconProps,
  ...props
}: TabProps<T>) {
  const { styles: baseStyles } = useStyles();
  const styles = baseStyles as Record<string, any>;
  const { activeTab, onChangeTab, variant } = useTabContext<T>();

  const isActive = activeTab === value;
  const Label = type === 'body' ? Typography.BodyBold : Typography.TitleBold;

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
      {variant === 'icon' ? (
        <SvgXml
          width={iconProps?.width || 24}
          height={iconProps?.height || 24}
          xml={iconProps?.xml ?? ''}
          color={
            isActive
              ? styles[`active${capitalize(variant)}TabText`].color
              : styles[`${variant}TabText`].color
          }
        />
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
