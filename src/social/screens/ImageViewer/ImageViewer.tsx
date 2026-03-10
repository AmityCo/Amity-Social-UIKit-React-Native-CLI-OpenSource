import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Header } from './components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import ImageViewing from 'react-native-image-viewing';
import { RootStackParamList } from '../../../core/routes/RouteParamList';

export function ImageViewerScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const routes = useRoute<RouteProp<RootStackParamList, 'ImageViewer'>>();

  const { images } = routes.params;

  const HeaderComponent = useCallback(
    () => <Header onPress={navigation.goBack} />,
    [navigation]
  );

  return (
    <ImageViewing
      visible
      imageIndex={0}
      images={images}
      animationType="slide"
      HeaderComponent={HeaderComponent}
      onRequestClose={navigation.goBack}
    />
  );
}
