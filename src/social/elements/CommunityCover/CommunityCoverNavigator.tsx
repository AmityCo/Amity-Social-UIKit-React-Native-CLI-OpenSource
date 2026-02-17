import React, { FC } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import BackButtonIconElement from '../../../v4/PublicApi/Elements/BackButtonIconElement/BackButtonIconElement';
import {
  CommonActions,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { hexToRgba } from '../../../core/utils/color';
import { PageID, ComponentID } from '../../enums';
import MenuButtonIconElement from '../../../v4/PublicApi/Elements/MenuButtonIconElement/MenuButtonIconElement';
import { useCommunity } from '../../hooks';

type CommunityCoverNavigatorProps = {
  pageId?: PageID;
  componentId?: ComponentID;
  communityId: Amity.Community['communityId'];
  isFromComponent?: boolean;
};

const CommunityCoverNavigator: FC<CommunityCoverNavigatorProps> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  communityId,
  isFromComponent,
}) => {
  const { community } = useCommunity(communityId);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'CommunityProfilePage'>>();
  const { pop } = route?.params || {};
  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 44,
      width: '100%',
      paddingHorizontal: 16,
      paddingVertical: 13,
      justifyContent: 'space-between',
      flexDirection: 'row',
    },
    button: {
      width: 32,
      height: 32,
      borderRadius: 99,
      backgroundColor: hexToRgba('#000000', 0.5),
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonIcon: {
      width: 24,
      height: 24,
      tintColor: 'white',
    },
  });

  const isPreviousRouteCommunityPostPermissionOrEditCommunity = () => {
    const navigationState = navigation.getState();
    const routes = navigationState.routes;
    const currentIndex = navigationState.index;
    const previousRoute = currentIndex > 0 ? routes[currentIndex - 1] : null;

    return (
      previousRoute?.name === 'CommunityPostPermission' ||
      previousRoute?.name === 'EditCommunity'
    );
  };
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.button}
        onPress={() => {
          if (isPreviousRouteCommunityPostPermissionOrEditCommunity()) {
            return navigation.pop(4);
          }

          const routes = navigation.getState().routes;
          if (pop === 2) {
            return navigation.pop(2);
          }
          if (isFromComponent && routes.length === 1) {
            navigation.navigate('AmitySocialHomePage');
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'AmitySocialHomePage' }],
              })
            );
          } else {
            navigation.goBack();
          }
        }}
      >
        <BackButtonIconElement
          pageID={pageId}
          componentID={componentId}
          style={styles.buttonIcon}
        />
      </Pressable>
      {community?.isJoined && (
        <Pressable
          style={styles.button}
          onPress={() =>
            navigation.navigate('CommunitySetting', {
              community,
            })
          }
        >
          <MenuButtonIconElement
            pageID={pageId}
            componentID={componentId}
            style={styles.buttonIcon}
          />
        </Pressable>
      )}
    </View>
  );
};

export default CommunityCoverNavigator;
