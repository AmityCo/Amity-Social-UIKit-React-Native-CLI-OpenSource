import { TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { Typography } from '../../../../core/components/Typography/Typography';
import { visitorLimit } from '../../../../core/assets/icons';
import { VISITOR_USAGE_LIMIT_MESSAGE } from '../../../../core/constants';
import { useUsageLimit } from './hooks';

export function UsageLimit() {
  const { styles, theme, onPressSignIn } = useUsageLimit();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left']}>
      <View style={styles.contentContainer}>
        <SvgXml
          accessible
          accessibilityLabel="Usage limit reached"
          width={60}
          height={40}
          style={styles.icon}
          xml={visitorLimit()}
          color={theme.colors.secondaryShade4}
        />
        <Typography.TitleBold style={styles.title}>
          {VISITOR_USAGE_LIMIT_MESSAGE.TITLE}
        </Typography.TitleBold>
        <Typography.Caption style={styles.subtitle}>
          {VISITOR_USAGE_LIMIT_MESSAGE.SUBTITLE}
        </Typography.Caption>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={onPressSignIn}
          accessibilityRole="button"
          accessibilityLabel={VISITOR_USAGE_LIMIT_MESSAGE.SIGN_IN}
        >
          <Typography.BodyBold style={styles.signInText}>
            {VISITOR_USAGE_LIMIT_MESSAGE.SIGN_IN}
          </Typography.BodyBold>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
