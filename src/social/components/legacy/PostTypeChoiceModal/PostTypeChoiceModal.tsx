import {
  Animated,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
} from 'react-native';
import { memo, useEffect, useRef, useState } from 'react';
import { SvgXml } from 'react-native-svg';
import CreatePostChooseTargetModal from '../CreatePostChooseTargetModal/CreatePostChooseTargetModal';
import { pollIcon, postIconOutlined } from '../../../../core/assets/icons/xml';
import { useStyles } from './style';
import { MyMD3Theme } from '../../../../core/providers/AmityUIKitProvider';
import { useTheme } from 'react-native-paper';
import uiSlice from '../../../../core/stores/slices/uiSlice';
import {
  RootState,
  useUIKitDispatch,
  useUIKitSelector,
} from '../../../../core/stores/store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../core/routes/RouteParamList';

const PostTypeChoiceModal = () => {
  const styles = useStyles();
  const theme = useTheme() as MyMD3Theme;
  const dispatch = useUIKitDispatch();
  const navigation =
    useNavigation() as NativeStackNavigationProp<RootStackParamList>;
  const { closePostTypeChoiceModal } = uiSlice.actions;
  const { showPostTypeChoiceModal, userId, targetId, targetName, targetType } =
    useUIKitSelector((state: RootState) => state.ui);
  const [postType, setPostType] = useState<string>();
  const [createPostModalVisible, setCreatePostModalVisible] = useState(false);

  const onChooseType = (type: string) => {
    if (!(targetId && targetName && targetType)) {
      setPostType(type);
      setCreatePostModalVisible(true);
      return;
    }

    if (type === 'post') {
      navigation.navigate('CreatePost', {
        targetId,
        targetType,
      });
    } else if (type === 'poll') {
      navigation.navigate('PollPostComposer', {
        targetId,
        targetName,
        targetType,
      });
    }

    closeCreatePostModal();
  };
  const closeCreatePostModal = () => {
    setCreatePostModalVisible(false);
    closeModal();
  };

  const closeModal = () => {
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      dispatch(closePostTypeChoiceModal());
    });
  };
  const slideAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showPostTypeChoiceModal) {
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [slideAnimation, showPostTypeChoiceModal]);

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
    <Modal
      animationType="fade"
      transparent={true}
      visible={showPostTypeChoiceModal}
      onRequestClose={closeModal}
    >
      <Pressable onPress={closeModal} style={styles.modalContainer}>
        <Animated.View style={[styles.modalContent, modalStyle]}>
          <TouchableOpacity
            onPress={() => onChooseType('post')}
            style={styles.modalRow}
          >
            <SvgXml
              xml={postIconOutlined(theme.colors.base)}
              width="24"
              height="24"
            />
            <Text style={styles.postText}>Post</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onChooseType('poll')}
            style={styles.modalRow}
          >
            <SvgXml xml={pollIcon(theme.colors.base)} width="24" height="24" />
            <Text style={styles.postText}>Poll</Text>
          </TouchableOpacity>
          <CreatePostChooseTargetModal
            visible={createPostModalVisible}
            onClose={closeCreatePostModal}
            userId={userId}
            onSelect={closeCreatePostModal}
            postType={postType}
          />
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default memo(PostTypeChoiceModal);
