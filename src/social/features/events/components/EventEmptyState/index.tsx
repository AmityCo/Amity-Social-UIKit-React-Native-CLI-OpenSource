import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from 'react-native-paper';
import { eventOutlined } from '../../../../../core/assets/icons';
import { Typography } from '../../../../../core/components/Typography/Typography';
import { EVENTS_STRINGS } from '../../constants';
import type { MyMD3Theme } from '../../../../../core/providers/AmityUIKitProvider';

// Web parity: EmptyContent (variant item) with the EventOutlined icon
// (3.75rem, secondary-shade4) and "No events yet" in base-shade3.
const EventEmptyState = ({
  text = EVENTS_STRINGS.NO_EVENTS_YET,
}: {
  text?: string;
}) => {
  const theme = useTheme<MyMD3Theme>();
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: 24,
      paddingHorizontal: 8,
    },
    text: {
      marginTop: 4,
      textAlign: 'center',
      color: theme.colors.baseShade3,
    },
  });

  return (
    <View style={styles.container}>
      <SvgXml
        width={60}
        height={60}
        xml={eventOutlined()}
        color={theme.colors.secondaryShade4}
      />
      <Typography.TitleBold style={styles.text}>{text}</Typography.TitleBold>
    </View>
  );
};

export default memo(EventEmptyState);
