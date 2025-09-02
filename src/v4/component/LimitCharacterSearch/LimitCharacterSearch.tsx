import React from 'react';
import { SvgXml } from 'react-native-svg';
import { search } from '~/v4/assets/icons';
import { View, ViewProps } from 'react-native';
import { Typography } from '../Typography/Typography';
import { useStyles } from './styles';

type LimitCharacterSearchProps = ViewProps;

function LimitCharacterSearch(props: LimitCharacterSearchProps) {
  const { styles, theme } = useStyles();

  return (
    <View {...props} style={[styles.container, props.style]}>
      <SvgXml
        xml={search()}
        width={60}
        height={60}
        color={theme.colors.secondaryShade4}
      />
      <Typography.TitleBold style={styles.text}>
        Start your search by typing {'\n'}at least 3 letters
      </Typography.TitleBold>
    </View>
  );
}

export default LimitCharacterSearch;
