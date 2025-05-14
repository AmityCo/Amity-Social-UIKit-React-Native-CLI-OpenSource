import React, { FC, useEffect } from 'react';
import { PageID, ComponentID, ElementID } from '../../enum';
import { useFile } from '../../hook/useFile';
import { useAmityElement } from '../../hook';
import LinearGradient from 'react-native-linear-gradient';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import BackButtonIconElement from '../../PublicApi/Elements/BackButtonIconElement/BackButtonIconElement';
import MenuButtonIconElement from '../../PublicApi/Elements/MenuButtonIconElement/MenuButtonIconElement';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes/RouteParamList';
import { hexToRgba } from '../../../util/colorUtil';

type CommunityCoverProps = {
  pageId?: PageID;
  componentId?: ComponentID;
  community: Amity.Community;
};

const CommunityCover: FC<CommunityCoverProps> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  community,
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { getImage } = useFile();
  const elementId = ElementID.community_cover;
  const { accessibilityId, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const [image, setImage] = React.useState<string | null>(null);

  const styles = StyleSheet.create({
    placehoder: {
      width: '100%',
      height: 187.5,
    },
    coverImage: {
      width: '100%',
      height: 187.5,
    },
    buttonWrap: {
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

  useEffect(() => {
    if (!community.avatarFileId) return;

    const fetchImage = async () => {
      const imageUrl = await getImage({ fileId: community.avatarFileId });
      setImage(imageUrl);
    };

    fetchImage();
  }, [community.avatarFileId, getImage]);

  return (
    <View testID={accessibilityId}>
      {image ? (
        <Image
          source={{ uri: image }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={[
            themeStyles.colors.baseShade3,
            themeStyles.colors.baseShade2,
          ]}
          style={styles.placehoder}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
        />
      )}
      <View style={styles.buttonWrap}>
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
    </View>
  );
};

export default CommunityCover;
