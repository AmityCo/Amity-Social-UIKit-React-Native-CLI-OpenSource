import React, { createContext, useContext, PropsWithChildren } from 'react';
import {
  View,
  Pressable,
  ViewStyle,
  ViewProps,
  PressableProps,
} from 'react-native';
import { SvgXml, XmlProps } from 'react-native-svg';
import {
  radioChecked,
  radioUnchecked,
  radioCheckedDisabled,
  radioUncheckedDisabled,
} from '../../assets/icons';
import { useStyles } from './styles';

type RadioContextType = {
  disabled?: boolean;
  value: string | number;
  onChange: (value: string | number) => void;
};

const RadioContext = createContext<RadioContextType | null>(null);

const useRadioContext = () => {
  const context = useContext(RadioContext);
  return context;
};

type GroupProps = RadioContextType & PropsWithChildren<ViewProps>;

const Group = ({
  value,
  onChange,
  children,
  disabled,
  ...props
}: GroupProps) => {
  return (
    <RadioContext.Provider value={{ value, onChange, disabled }}>
      <View {...props}>{children}</View>
    </RadioContext.Provider>
  );
};

type OptionProps = PropsWithChildren<Omit<PressableProps, 'style'>> & {
  style?: ViewStyle;
  disabled?: boolean;
  value: string | number;
};

const OptionContext = createContext<{
  value: OptionProps['value'];
  disabled: OptionProps['disabled'];
} | null>(null);

const useOptionContext = () => {
  const context = useContext(OptionContext);
  return context;
};

const Option = ({
  style,
  value,
  children,
  disabled,
  accessibilityHint,
  accessibilityLabel,
  ...props
}: OptionProps) => {
  const {
    onChange,
    value: selectedValue,
    disabled: groupDisabled,
  } = useRadioContext();
  const { styles } = useStyles();

  const isSelected = selectedValue === value;
  const isDisabled = disabled || groupDisabled;

  return (
    <OptionContext.Provider value={{ value, disabled: isDisabled }}>
      <Pressable
        {...props}
        disabled={isDisabled}
        accessibilityRole="radio"
        onPress={() => !isDisabled && onChange(value)}
        accessibilityLabel={accessibilityLabel || `Option ${value}`}
        accessibilityState={{ checked: isSelected, disabled: isDisabled }}
        accessibilityHint={
          accessibilityHint || `${isSelected ? 'Selected' : 'Not selected'}.`
        }
        style={({ pressed }) => [
          styles.option,
          pressed && styles.optionPressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    </OptionContext.Provider>
  );
};

type IconProps = Omit<XmlProps, 'xml'> & {
  style?: ViewStyle;
};

const Icon = ({ width = 24, height = 24, style, ...props }: IconProps) => {
  const { theme } = useStyles();
  const option = useOptionContext();
  const { value } = useRadioContext();
  const isSelected = value === option?.value;

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
