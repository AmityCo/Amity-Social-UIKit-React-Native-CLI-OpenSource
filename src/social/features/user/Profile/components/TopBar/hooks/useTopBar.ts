import { useStyles } from '../styles';
import { useAmityElement } from '../../../../../../hooks';
import { ComponentID, ElementID, PageID } from '../../../../../../enums';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../../core/routes/RouteParamList';

type UseTopBarParams = {
  inline?: boolean;
};

export function useTopBar({ inline }: UseTopBarParams) {
  const pageId = PageID.user_profile_page;

  const { styles } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { accessibilityId: backButtonId } = useAmityElement({
    pageId,
    componentId: ComponentID.WildCardComponent,
    elementId: ElementID.back_button,
  });

  const handleGoBack = () => {
    const routes = navigation.getState().routes;
    if (inline && routes.length === 1) {
      navigation.navigate('AmitySocialHomePage');
    } else {
      navigation.goBack();
    }
  };

  return {
    styles,
    handleGoBack,
    backButtonId,
  };
}
