import React, { FC } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import BackButtonIconElement from '../../PublicApi/Elements/BackButtonIconElement/BackButtonIconElement';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes/RouteParamList';
import { hexToRgba } from '../../../util/colorUtil';
import { PageID, ComponentID } from '../../enum';
import MenuButtonIconElement from '../../PublicApi/Elements/MenuButtonIconElement/MenuButtonIconElement';
import { useCommunity } from '../../hook';

type CommunityCoverNavigatorProps = {
  pageId?: PageID;
  componentId?: ComponentID;
  communityId: Amity.Community['communityId'];
};

const CommunityCoverNavigator: FC<CommunityCoverNavigatorProps> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  communityId,
}) => {
  const { community } = useCommunity(communityId);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={() => navigation.goBack()}>
        <BackButtonIconElement
          pageID={pageId}
          componentID={componentId}
          style={styles.buttonIcon}
        />
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() =>
          navigation.navigate('EditCommunity', {
            communityData: community,
          })
        }
      >
        <MenuButtonIconElement
          pageID={pageId}
          componentID={componentId}
          style={styles.buttonIcon}
        />
      </Pressable>
    </View>
  );
};

export default CommunityCoverNavigator;
