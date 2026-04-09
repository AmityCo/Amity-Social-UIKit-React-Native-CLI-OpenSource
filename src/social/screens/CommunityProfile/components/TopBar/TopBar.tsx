import { Pressable, View } from 'react-native';
import { ReactNode } from 'react';
import BackButtonIconElement from '../../../../elements/BackButtonIconElement/BackButtonIconElement';
import {
  CommonActions,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../core/routes/RouteParamList';
import { PageID, ComponentID } from '../../../../enums';
import { useStyles } from './styles';
import { useCommunity } from '../../../../hooks';
import { useBottomSheet } from '../../../../../core/stores/slices/bottomSheetSlice';
import { useShareableLink } from '../../../../../core/hooks/useShareableLink';
import { ShareableLinkModel } from '../../../../types';
import MenuAction from '../../../../elements/MenuAction/MenuAction';
import MenuButton from '../../../../elements/MenuButton/MenuButton';
import { settings, people } from '../../../../../core/assets/icons';
import { CopyLinkAction } from '../../../../elements/CopyLinkAction';
import { ShareAction } from '../../../../elements/ShareAction';
import { checkEditCommunityPermission } from '../../../../utils/permissions';

type TopBarProps = {
  pageId?: PageID;
  componentId?: ComponentID;
  communityId: Amity.Community['communityId'];
  isFromComponent?: boolean;
};

export function TopBar({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  communityId,
  isFromComponent,
}: TopBarProps) {
  const { styles } = useStyles();
  const { community } = useCommunity(communityId);
  const { getShareLink } = useShareableLink();
  const { openBottomSheet, closeBottomSheet, bottomSheetHeight } =
    useBottomSheet();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'CommunityProfilePage'>>();
  const { pop } = route?.params || {};

  const shareLink = community
    ? getShareLink(ShareableLinkModel.communities, community.communityId)
    : null;

  const isModerator = checkEditCommunityPermission(community?.communityId);

  const canShare =
    !!shareLink &&
    (community?.isPublic || community?.isDiscoverable || isModerator);

  const isJoined = community?.isJoined;

  const actions: { show: boolean; action: ReactNode }[] = [
    {
      show: !!isJoined && !!isModerator,
      action: (
        <MenuAction
          gap="small"
          key="settings"
          iconProps={{ xml: settings() }}
          label="Community settings"
          onPress={() => {
            closeBottomSheet();
            navigation.navigate('CommunitySetting', { community });
          }}
        />
      ),
    },
    {
      show: !!isJoined && !isModerator,
      action: (
        <MenuAction
          key="info"
          gap="small"
          iconProps={{ xml: people() }}
          label="Community information"
          onPress={() => {
            closeBottomSheet();
            navigation.navigate('CommunitySetting', { community });
          }}
        />
      ),
    },
    {
      show: !!canShare,
      action: (
        <CopyLinkAction
          key="copy"
          link={shareLink}
          pageId={PageID.community_profile_page}
        />
      ),
    },
    {
      show: !!canShare,
      action: (
        <ShareAction
          key="share"
          link={shareLink}
          pageId={PageID.community_profile_page}
        />
      ),
    },
  ].filter(({ show }) => show);

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
      {(community?.isJoined || canShare) && (
        <MenuButton
          pageId={pageId}
          variant="filled"
          componentId={componentId}
          onPress={() => {
            openBottomSheet({
              height: bottomSheetHeight[actions.length],
              content: <View>{actions.map(({ action }) => action)}</View>,
            });
          }}
        />
      )}
    </View>
  );
}
