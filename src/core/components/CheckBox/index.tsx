import React, { createContext, useContext, PropsWithChildren } from 'react';
import {
  View,
  Pressable,
  ViewStyle,
  ViewProps,
  PressableProps,
  StyleProp,
} from 'react-native';
import { SvgXml, XmlProps } from 'react-native-svg';
import {
  checkboxChecked,
  checkboxUnchecked,
  checkboxCheckedDisabled,
  checkboxUncheckedDisabled,
} from '../../assets/icons';
import { useStyles } from './styles';

type CheckBoxContextType<T extends any = string> = {
  value: T[];
  disabled?: boolean;
  onChange: (value: T[]) => void;
  select?: (value: T[], option: T) => boolean;
  extractKey?: (value: T) => string;
};

const CheckBoxContext = createContext<CheckBoxContextType<any> | null>(null);

const useCheckBoxContext = () => {
  const context = useContext(CheckBoxContext);
  return context;
};

type GroupProps<T> = CheckBoxContextType<T> & PropsWithChildren<ViewProps>;

function Group<T>({
  value,
  select,
  onChange,
  children,
  disabled,
  extractKey,
  ...props
}: GroupProps<T>) {
  return (
    <CheckBoxContext.Provider
      value={{ value, onChange, disabled, select, extractKey }}
    >
      <View {...props}>{children}</View>
    </CheckBoxContext.Provider>
  );
}

type OptionProps<T extends any = string> = PropsWithChildren<
  Omit<PressableProps, 'style'>
> & {
  style?: (state: {
    pressed: boolean;
    selected: boolean;
    disabled: boolean;
  }) => StyleProp<ViewStyle>;
  disabled?: boolean;
  value: T;
};

const OptionContext = createContext<Pick<
  OptionProps<any>,
  'value' | 'disabled'
> | null>(null);

const useOptionContext = () => {
  const context = useContext(OptionContext);
  return context;
};

function Option<T extends any = string>({
  style,
  value,
  children,
  disabled,
  accessibilityHint,
  accessibilityLabel,
  ...props
}: OptionProps<T>) {
  const {
    select,
    onChange,
    extractKey,
    value: selectedValue,
    disabled: groupDisabled,
  } = useCheckBoxContext();
  const { styles } = useStyles();

  const selected = select
    ? select(selectedValue, value)
    : selectedValue.includes(value);

  const isDisabled = disabled || groupDisabled;

  const handlePress = () => {
    if (isDisabled) return;
    const newValue = selected
      ? selectedValue.filter((v) =>
          extractKey ? extractKey(v) !== extractKey(value) : v !== value
        )
      : [...selectedValue, value];
    onChange(newValue);
  };

  return (
    <OptionContext.Provider value={{ value, disabled: isDisabled }}>
      <Pressable
        {...props}
        disabled={isDisabled}
        onPress={handlePress}
        accessibilityRole="checkbox"
        accessibilityLabel={accessibilityLabel || `Option ${value}`}
        accessibilityState={{ checked: selected, disabled: isDisabled }}
        accessibilityHint={
          accessibilityHint || `${selected ? 'Selected' : 'Not selected'}.`
        }
        style={({ pressed }) => [
          styles.option,
          pressed && styles.optionPressed,
          style && style({ pressed, selected, disabled: isDisabled }),
        ]}
      >
        {children}
      </Pressable>
    </OptionContext.Provider>
  );
}

type IconProps = Omit<XmlProps, 'xml'> & {
  style?: ViewStyle;
};

const Icon = ({ width = 24, height = 24, style, ...props }: IconProps) => {
  const { theme } = useStyles();
  const option = useOptionContext();
  const { value, select } = useCheckBoxContext();

  const isSelected = select
    ? select(value, option.value)
    : value.includes(option?.value);

  const color = isSelected
    ? option?.disabled
      ? theme.colors.primaryShade3
      : theme.colors.primary
    : option?.disabled
    ? theme.colors.baseShade4
    : theme.colors.baseShade3;

  const icon = isSelected
    ? option?.disabled
      ? checkboxCheckedDisabled()
      : checkboxChecked()
    : option?.disabled
    ? checkboxUncheckedDisabled()
    : checkboxUnchecked();

  return (
    <View style={style}>
      <SvgXml
        {...props}
        xml={icon}
        color={color}
        width={width}
        height={height}
      />
    </View>
  );
};

type LabelProps = ViewProps;

const Label = ({ children, ...props }: LabelProps) => {
  return <View {...props}>{children}</View>;
};

export const CheckBox = { Group, Option, Icon, Label };
