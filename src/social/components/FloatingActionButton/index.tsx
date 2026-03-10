import { Pressable, PressableProps, View } from 'react-native';
import { SvgXml, XmlProps } from 'react-native-svg';
import { useStyles } from './styles';
import { plus } from '../../../core/assets/icons';

type FloatingActionButtonProps = PressableProps & {
  icon?: XmlProps['xml'];
};

export function FloatingActionButton({
  icon,
  ...props
}: FloatingActionButtonProps) {
  const { styles, theme } = useStyles();

  return (
    <View style={styles.container}>
      <Pressable {...props} style={styles.button}>
        <SvgXml
          width="32"
          height="32"
          xml={icon || plus()}
          color={theme.colors.background}
        />
      </Pressable>
    </View>
  );
}
