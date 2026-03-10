import { useStyle } from './styles';
import { Dimensions, View } from 'react-native';
import { Typography } from '../../../core/components/Typography/Typography';
import { SvgXml } from 'react-native-svg';
import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils';
import emptyList from '../../../core/assets/icons/emptyList';
import {
  block,
  emptyImagePost,
  emptyPost,
  emptyVideoPost,
  firework,
  privateFeed,
} from '../../../core/assets/icons';

export type EmptyProps = {
  heightPercent?: number;
} & ViewProps;

export function Empty({ heightPercent = 0.3, children, ...props }: EmptyProps) {
  const { styles } = useStyle();
  const dimension = Dimensions.get('window');

  console.log('heightPercent', heightPercent, dimension.height * heightPercent);

  return (
    <View
      {...props}
      style={[
        styles.container,
        {
          minHeight: dimension.height * heightPercent,
        },
      ]}
    >
      {children}
    </View>
  );
}

const EMPTY_ICONS = {
  list: emptyList(),
  post: emptyPost(),
  private: privateFeed(),
  image: emptyImagePost(),
  video: emptyVideoPost(),
  block: block(),
  review: firework(),
};

export type EmptyContentProps = {
  title: string;
  description?: string;
  icon?: keyof typeof EMPTY_ICONS;
};

function EmptyContent({ title, icon, description }: EmptyContentProps) {
  const { styles, theme } = useStyle();

  return (
    <View style={styles.contentContainer}>
      <SvgXml
        width={60}
        height={60}
        xml={icon ? EMPTY_ICONS[icon] : undefined}
        color={theme.colors.baseShade4}
      />
      <View>
        <Typography.TitleBold style={styles.title}>
          {title}
        </Typography.TitleBold>
        {description && (
          <Typography.Caption style={styles.description}>
            {description}
          </Typography.Caption>
        )}
      </View>
    </View>
  );
}

Empty.Content = EmptyContent;
