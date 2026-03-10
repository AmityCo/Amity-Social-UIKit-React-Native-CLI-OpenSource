import { Pressable, PressableProps, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { close } from '../../../../../core/assets/icons';
import { useStyles } from './styles';

type HeaderProps = PressableProps;

export function Header(props: HeaderProps) {
  const { styles, theme } = useStyles();

  return (
    <View style={styles.header}>
      <Pressable style={styles.closeButton} hitSlop={8} {...props}>
        <SvgXml
          width={24}
          height={24}
          xml={close()}
          color={theme.colors.base}
        />
      </Pressable>
    </View>
  );
}
