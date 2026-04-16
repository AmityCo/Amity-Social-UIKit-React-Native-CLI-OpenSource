import { SvgXml } from 'react-native-svg';
import { noResult } from '../../../core/assets/icons';
import { View, ViewProps } from 'react-native';
import { Typography } from '../../../core/components/Typography/Typography';
import { useStyles } from './styles';

type NoResultProps = ViewProps;

function NoResult(props: NoResultProps) {
  const { styles, theme } = useStyles();

  return (
    <View {...props} style={[styles.container, props.style]}>
      <SvgXml
        xml={noResult()}
        width={60}
        height={60}
        color={theme.colors.secondaryShade4}
      />
      <Typography.TitleBold style={styles.text}>
        No results found
      </Typography.TitleBold>
    </View>
  );
}

export default NoResult;
