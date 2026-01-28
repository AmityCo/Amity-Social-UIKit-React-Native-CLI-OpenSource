import React, { useCallback, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ComponentID, PageID } from '../../../enum/enumUIKitID';
import { useAmityComponent, useStoryPermission } from '../../../hook';
import { useBehaviour } from '../../../providers/BehaviourProvider';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../../v4/routes/RouteParamList';
import { AmityPostTargetSelectionPageType } from '../../../enum';
import { livestream, poll, post, story } from '~/v4/assets/icons';
import MenuAction from '../../../../v4/elements/MenuAction';

interface AmityCreatePostMenuComponentProps {
  pageId?: PageID;
  componentId?: ComponentID;
}

const AmityCreatePostMenuComponent = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}: AmityCreatePostMenuComponentProps): React.JSX.Element => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { themeStyles } = useAmityComponent({ pageId, componentId });

  const { AmityCreatePostMenuComponentBehavior } = useBehaviour();

  const hasStoryPermission = useStoryPermission();

  const styles = StyleSheet.create({
    container: {
      paddingVertical: 12,
      width: 200,
      backgroundColor: themeStyles.colors.background,
      borderRadius: 12,
    },
    menu: {
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

  const onPressCreatePost = useCallback(
    (postType: AmityPostTargetSelectionPageType) => {
      const postTypeHandlers = {
        [AmityPostTargetSelectionPageType.post]: () => {
          if (AmityCreatePostMenuComponentBehavior.goToSelectPostTargetPage) {
            AmityCreatePostMenuComponentBehavior.goToSelectPostTargetPage({
              postType,
            });
          }
          navigation.navigate('PostTargetSelection', { postType });
        },

        [AmityPostTargetSelectionPageType.story]: () => {
          if (AmityCreatePostMenuComponentBehavior.goToSelectStoryTargetPage) {
            AmityCreatePostMenuComponentBehavior.goToSelectStoryTargetPage();
          }
          navigation.navigate('StoryTargetSelection');
        },

        [AmityPostTargetSelectionPageType.poll]: () => {
          if (
            AmityCreatePostMenuComponentBehavior.goToSelectPollPostTargetPage
          ) {
            AmityCreatePostMenuComponentBehavior.goToSelectPollPostTargetPage();
          }
          navigation.navigate('PollTargetSelection');
        },

        [AmityPostTargetSelectionPageType.livestream]: () => {
          if (
            AmityCreatePostMenuComponentBehavior.goToSelectLivestreamPostTargetPage
          ) {
            AmityCreatePostMenuComponentBehavior.goToSelectLivestreamPostTargetPage();
          }
          navigation.navigate('LivestreamPostTargetSelection');
        },
      };
      postTypeHandlers[postType]?.();
    },
    [AmityCreatePostMenuComponentBehavior, navigation]
  );

  return (
    <View style={styles.container}>
      <MenuAction
        onPress={() => onPressCreatePost(AmityPostTargetSelectionPageType.post)}
        style={styles.menu}
        label="Post"
        iconProps={{
          xml: post(),
        }}
      />
      {hasStoryPermission && (
        <MenuAction
          style={styles.menu}
          label="Story"
          iconProps={{
            xml: story(),
          }}
          onPress={() =>
            onPressCreatePost(AmityPostTargetSelectionPageType.story)
          }
        />
      )}
      <MenuAction
        style={styles.menu}
        label="Poll"
        iconProps={{
          xml: poll(),
        }}
        onPress={() => onPressCreatePost(AmityPostTargetSelectionPageType.poll)}
      />
      <MenuAction
        style={styles.menu}
        label="Livestream"
        iconProps={{
          xml: livestream(),
        }}
        onPress={() =>
          onPressCreatePost(AmityPostTargetSelectionPageType.livestream)
        }
      />
    </View>
  );
};

export default memo(AmityCreatePostMenuComponent);
