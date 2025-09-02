import React, { useRef, useState } from 'react';
import { TextInput, TextInputProps, View, ViewProps } from 'react-native';
import { useStyles } from './styles';
import { SvgXml, XmlProps } from 'react-native-svg';
import { search } from '~/v4/assets/icons';

type SearchInputProps = {
  iconProps?: XmlProps;
  style?: ViewProps['style'];
  inputProps?: TextInputProps;
};

function SearchInput({ iconProps, inputProps, style }: SearchInputProps) {
  const ref = useRef(0);
  const { styles, theme } = useStyles();
  const [value, setValue] = useState(inputProps?.value);

  return (
    <View style={[styles.container, style]}>
      <SvgXml
        {...iconProps}
        width={20}
        height={20}
        xml={search()}
        color={theme.colors.baseShade3}
      />
      <TextInput
        {...inputProps}
        value={value}
        placeholder={inputProps?.placeholder}
        style={[styles.input, inputProps?.style]}
        placeholderTextColor={theme.colors.baseShade2}
        onChangeText={(text) => {
          clearTimeout(ref.current);
          ref.current = setTimeout(() => inputProps?.onChangeText(text), 500);
          setValue(text);
        }}
      />
    </View>
  );
}

export default SearchInput;
