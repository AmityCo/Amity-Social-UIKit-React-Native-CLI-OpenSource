/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
// import { useTranslation } from 'react-i18next';

import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Modal,
  Pressable,
  LogBox,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { plusIcon, postIconOutlined, searchIcon } from '../../svg/svg-xml-list';
import FloatingButton from '../../components/FloatingButton';
import useAuth from '../../hooks/useAuth';
import Explore from '../Explore';
import GlobalFeed from '../GlobalFeed';
import { useStyles } from './styles';
import CreatePostModal from '../../components/CreatePostModal';
import CustomTab from '../../components/CustomTab';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../providers/amity-ui-kit-provider';
import AllMyCommunity from '../AllMyCommunity';
import useConfig from '../../hooks/useConfig';
import { ComponentID } from '../../util/enumUIKitID';

import { TabName } from '../../enum/tabNameState';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
LogBox.ignoreAllLogs(true);
export default function Home() {
  const styles = useStyles();
  const { client } = useAuth();
  const theme = useTheme() as MyMD3Theme;

  const { excludes } = useConfig();

  const [activeTab, setActiveTab] = useState<string>(TabName.NewsFeed);
  const [isVisible, setIsVisible] = useState(false);

  const [createPostModalVisible, setCreatePostModalVisible] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const onClickSearch = () => {
    navigation.navigate('CommunitySearch');
  };
  const onClickAddCommunity = () => {
    navigation.navigate('CreateCommunity');
  };
  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        activeTab === TabName.MyCommunities ? (
          <TouchableOpacity
            onPress={onClickAddCommunity}
            style={styles.btnWrap}
          >
            <SvgXml xml={plusIcon(theme.colors.base)} width="25" height="25" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onClickSearch} style={styles.btnWrap}>
            <SvgXml
              xml={searchIcon(theme.colors.base)}
              width="25"
              height="25"
            />
          </TouchableOpacity>
        ),
      headerTitle: 'Community',
    });
  }, []);

  const openCreatePostModal = () => {
    setCreatePostModalVisible(true);
  };
  const closeCreatePostModal = () => {
    setCreatePostModalVisible(false);
    closeModal();
  };
  const openModal = () => {
    setIsVisible(true);
  };

  const closeModal = () => {
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsVisible(false));
  };
  const slideAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnimation]);

  const modalStyle = {
    transform: [
      {
        translateY: slideAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [600, 0], // Adjust this value to control the sliding distance
        }),
      },
    ],
  };
  return (
    <View>
      <CustomTab
        tabName={
          excludes.includes(ComponentID.StoryTab)
            ? [TabName.NewsFeed, TabName.Explorer]
            : [TabName.NewsFeed, TabName.Explorer, TabName.MyCommunities]
        }
        onTabChange={setActiveTab}
      />
      {activeTab === TabName.NewsFeed ? (
        <View>
          <GlobalFeed />
          <FloatingButton onPress={openModal} />
        </View>
      ) : activeTab === TabName.Explorer ? (
        <View>
          <Explore />
        </View>
      ) : (
        <View>
          <AllMyCommunity />
        </View>
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isVisible}
        onRequestClose={closeModal}
      >
        <Pressable onPress={closeModal} style={styles.modalContainer}>
          <Animated.View style={[styles.modalContent, modalStyle]}>
            <TouchableOpacity
              onPress={openCreatePostModal}
              style={styles.modalRow}
            >
              <SvgXml
                xml={postIconOutlined(theme.colors.base)}
                width="28"
                height="28"
              />
              <Text style={styles.postText}>Post</Text>
            </TouchableOpacity>
            <CreatePostModal
              visible={createPostModalVisible}
              onClose={closeCreatePostModal}
              userId={(client as Amity.Client).userId as string}
              onSelect={closeCreatePostModal}
            />
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}
