import React from 'react';
import { View, Switch } from 'react-native';
import { usePollPostComposerContext } from './AmityPollPostComposerPage';
import { useStyles } from './styles';
import FormLabel from '../../../elements/FormLabel';
import { ElementID, PageID } from '../../../enum';
import FormDescription from '../../../elements/FormDescription';

export function PollSelection() {
  const { styles, theme } = useStyles();
  const { isMultipleOption, setIsMultipleOption } =
    usePollPostComposerContext();

  return (
    <View style={styles.fieldContainer}>
      <View style={styles.rowContainer}>
        <View style={styles.fillSpace}>
          <FormLabel
            style={styles.base}
            pageId={PageID.poll_post_composer_page}
            elementId={ElementID.poll_multiple_selection_title}
          />
          <FormDescription
            style={styles.baseShade1}
            pageId={PageID.poll_post_composer_page}
            elementId={ElementID.poll_multiple_selection_desc}
          />
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
