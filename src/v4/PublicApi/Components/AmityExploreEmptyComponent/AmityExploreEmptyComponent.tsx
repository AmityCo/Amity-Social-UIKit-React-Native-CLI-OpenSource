import React, { FC, memo, useCallback } from 'react';
import { useAmityComponent } from '../../../hook';
import { PageID, ComponentID } from '../../../enum';
import { emptyCommunity } from '../../../assets/icons';
import TitleElement from '../../Elements/TitleElement/TitleElement';
import DescriptionElement from '../../Elements/DescriptionElement/DescriptionElement';
import { View } from 'react-native';
import { useStyles } from './styles';
import { SvgXml } from 'react-native-svg';
import ExploreCreateCommunity from '../../../elements/ExploreCreateCommunity/ExploreCreateCommunity';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes/RouteParamList';

type AmityExploreEmptyComponentProps = {
  pageId?: PageID;
};

const AmityExploreEmptyComponent: FC<AmityExploreEmptyComponentProps> = ({
  pageId = PageID.WildCardPage,
}) => {
  const componentId = ComponentID.explore_empty;
  const { isExcluded, accessibilityId } = useAmityComponent({
    pageId,
    componentId,
  });

  const styles = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onPressCreateCommunity = useCallback(() => {
    navigation.navigate('CreateCommunity');
  }, [navigation]);

  if (isExcluded) return null;

  return (
    <View testID={accessibilityId} style={styles.container}>
      <SvgXml xml={emptyCommunity({})} />
      <TitleElement
        pageId={pageId}
        componentId={componentId}
        style={styles.title}
      />
      <DescriptionElement
        pageId={pageId}
        componentId={componentId}
        style={styles.description}
      />
      <ExploreCreateCommunity
        pageId={pageId}
        componentId={componentId}
        style={styles.createCommunityButton}
        onPress={onPressCreateCommunity}
      />
    </View>
  );
};
export default memo(AmityExploreEmptyComponent);
