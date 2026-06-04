import React from 'react';
import { Text } from 'react-native';
import styles from './styles';

interface CustomTextProps {
  children: React.ReactNode;
  style?: any;
  numberOfLines?: number;
  ellipsizeMode?: 'tail' | 'head' | 'middle' | 'clip' | undefined;
}

const CustomText: React.FC<CustomTextProps> = ({
  children,
  style,
  numberOfLines,
  ellipsizeMode = 'tail',
}) => {
  return (
    <Text
      style={[styles.text, style]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
    >
      {children}
    </Text>
  );
};
export default CustomText;
