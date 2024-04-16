import { Platform } from 'react-native';
import React, { FC, useCallback, useLayoutEffect, useRef } from 'react';
import AndroidCubeEffect from '../StoryKit/src/components/AndroidCubeEffect';
import CubeNavigationHorizontal from '../StoryKit/src/components/CubeNavigationHorizontal';
import AmityViewStoryPage from '../../PublicApi/AmityViewStoryPage/AmityViewStoryPage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes/RouteParamList';
import { useStoryPermission } from '../../hook';

interface IStorytargetView {
  currentCommunityIndex: number;
  setCurrentCommunityIndex: (arg: number) => void;
  globalStoryTargets: Amity.StoryTarget[];
  setViewStory: (arg: boolean) => void;
}

const StoryTargetView: FC<IStorytargetView> = ({
  currentCommunityIndex,
  setCurrentCommunityIndex,
  globalStoryTargets,
  setViewStory,
}) => {
  const cube = useRef<CubeNavigationHorizontal | AndroidCubeEffect>();
  const communityId = globalStoryTargets[currentCommunityIndex].targetId;
  const hasStoryPermission = useStoryPermission(communityId);

  const navigation =
    useNavigation() as NativeStackNavigationProp<RootStackParamList>;
  useLayoutEffect(() => {
    cube && cube.current.scrollTo(currentCommunityIndex);
  }, [currentCommunityIndex]);

  cube && cube?.current?.scrollTo(currentCommunityIndex);

  const onPressCreateStory = useCallback(() => {
    hasStoryPermission &&
      navigation.navigate('CreateStory', {
        targetId: communityId,
        targetType: 'community',
      });
  }, [communityId, hasStoryPermission, navigation]);

  const onPressAvatar = useCallback(() => {
    setViewStory(false);
    onPressCreateStory();
  }, [onPressCreateStory, setViewStory]);

  const onPressCommunityName = useCallback(() => {
    setViewStory(false);
    navigation.navigate('CommunityHome', {
      communityId: communityId,
      communityName: '',
    });
  }, [communityId, navigation, setViewStory]);

  const onFinish = useCallback(() => {
    setViewStory(false);
  }, [setViewStory]);

  if (Platform.OS === 'ios') {
    return (
      <CubeNavigationHorizontal
        ref={cube as React.LegacyRef<CubeNavigationHorizontal>}
        callBackAfterSwipe={(x: any) => {
          if (x !== currentCommunityIndex) {
            setCurrentCommunityIndex(parseInt(x, 10));
          }
        }}
      >
        {globalStoryTargets.map((storyTarget) => {
          return (
            <AmityViewStoryPage
              targetType={'community'}
              targetId={storyTarget.targetId}
              key={storyTarget.targetId}
              onFinish={onFinish}
              onPressAvatar={onPressAvatar}
              onPressCommunityName={onPressCommunityName}
            />
          );
        })}
      </CubeNavigationHorizontal>
    );
  } else {
    return (
      <AndroidCubeEffect
        ref={cube as React.LegacyRef<AndroidCubeEffect>}
        callBackAfterSwipe={(x: any) => {
          if (x !== currentCommunityIndex) {
            setCurrentCommunityIndex(parseInt(x, 10));
          }
        }}
      >
        {globalStoryTargets.map((storyTarget) => {
          return (
            <AmityViewStoryPage
              targetType={'community'}
              targetId={storyTarget.targetId}
              key={storyTarget.targetId}
              onFinish={onFinish}
              onPressAvatar={onPressAvatar}
              onPressCommunityName={onPressCommunityName}
            />
          );
        })}
      </AndroidCubeEffect>
    );
  }
};

export default StoryTargetView;
