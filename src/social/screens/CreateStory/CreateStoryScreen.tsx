import { useCameraDevice } from 'react-native-vision-camera';
import AmityCreateStoryPage from '../../features/story/Create';
import { useRequestPermission } from '../../hooks/useCamera';
import { Alert, Linking } from 'react-native';

const CreateStoryScreen = ({ navigation, route }) => {
  const { targetId, targetType } = route.params as {
    targetId: string;
    targetType: Amity.StoryTargetType;
  };

  useRequestPermission({
    onRequestPermissionFailed: () => {
      Linking.openSettings();
    },
    shouldCall: true,
  });

  const backCamera = useCameraDevice('back');
  const frontCamera = useCameraDevice('front');

  if (!frontCamera && !backCamera) {
    Alert.alert('Camera Error', 'Cannot open camera', [
      {
        text: 'Go Back',
        onPress: () => {
          navigation.goBack();
        },
      },
    ]);
    return null;
  }

  const handleCreateStory = () => {
    const state = navigation.getState();
    const routes = state.routes;
    const currentIndex = state.index;

    if (currentIndex > 0) {
      const previousRoute = routes[currentIndex - 1];
      const previousRouteName = previousRoute.name;

      if (
        previousRouteName === 'ViewStory' ||
        previousRouteName === 'StoryTargetSelection'
      ) {
        navigation.pop(2);
        return;
      }
    }

    navigation.goBack();
  };

  return (
    <AmityCreateStoryPage
      targetId={targetId}
      targetType={targetType}
      onCreateStory={handleCreateStory}
    />
  );
};

export default CreateStoryScreen;
