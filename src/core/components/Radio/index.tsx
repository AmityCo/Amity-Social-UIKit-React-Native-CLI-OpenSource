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
  radioChecked,
  radioUnchecked,
  radioCheckedDisabled,
  radioUncheckedDisabled,
} from '../../assets/icons';
import { useStyles } from './styles';

type RadioContextType<T extends any = string | number> = {
  disabled?: boolean;
  value: T;
  onChange: (value: T) => void;
  select?: (value: T, option: T) => boolean;
};

const RadioContext = createContext<RadioContextType<any> | null>(null);

const useRadioContext = () => {
  const context = useContext(RadioContext);
  return context;
};

type GroupProps<T> = RadioContextType<T> & PropsWithChildren<ViewProps>;

function Group<T>({
  value,
  onChange,
  children,
  disabled,
  ...props
}: GroupProps<T>) {
  return (
    <RadioContext.Provider value={{ value, onChange, disabled }}>
      <View {...props} accessibilityRole="radiogroup">
        {children}
      </View>
    </RadioContext.Provider>
  );
}

type OptionProps<T extends any = string | number> = PropsWithChildren<
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

function Option<T extends any = string | number>({
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
    value: selectedValue,
    disabled: groupDisabled,
  } = useRadioContext();
  const { styles } = useStyles();

  const selected = select
    ? select(selectedValue, value)
    : selectedValue === value;

  const isDisabled = disabled || groupDisabled;

  return (
    <OptionContext.Provider value={{ value, disabled: isDisabled }}>
      <Pressable
        {...props}
        disabled={isDisabled}
        accessibilityRole="radio"
        onPress={() => !isDisabled && onChange(value)}
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
  const { value, select } = useRadioContext();

  const isSelected = select
    ? select(value, option.value)
    : value === option?.value;

  const color = isSelected
    ? option?.disabled
      ? theme.colors.primaryShade3
      : theme.colors.primary
    : option?.disabled
    ? theme.colors.baseShade4
    : theme.colors.baseShade3;

  const icon = isSelected
    ? option?.disabled
      ? radioCheckedDisabled()
      : radioChecked()
    : option?.disabled
    ? radioUncheckedDisabled()
    : radioUnchecked();

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

export const Radio = { Group, Option, Icon, Label };
