import React from 'react';
import { View, Switch } from 'react-native';
import { Typography } from '../../../component/Typography/Typography';
import { usePollPostComposerContext } from './AmityPollPostComposerPage';
import { useStyles } from './styles';

export function PollSelection() {
  const { styles, theme } = useStyles();
  const { isMultipleOption, setIsMultipleOption } =
    usePollPostComposerContext();

  return (
    <View style={styles.fieldContainer}>
      <View style={styles.rowContainer}>
        <View style={styles.fillSpace}>
          <Typography.TitleBold style={styles.base}>
            Multiple selection
          </Typography.TitleBold>
          <Typography.Caption style={styles.baseShade1}>
            Let participants vote more than one option.
          </Typography.Caption>
        </View>
        <Switch
          ios_backgroundColor={theme.colors.baseShade3}
          thumbColor={theme.colors.background}
          trackColor={{
            false: theme.colors.baseShade3,
            true: theme.colors.primary,
          }}
          value={isMultipleOption}
          onValueChange={setIsMultipleOption}
        />
      </View>
    </View>
  );
}
