import { Pressable, View, Animated, Easing } from 'react-native';
import { FC, memo, useCallback, useEffect, useRef } from 'react';
import { PageID, ComponentID, mediaAttachment } from '../../../../enums';
import { useAmityComponent } from '../../../../hooks';
import { useStyles } from './styles';
import { SvgXml } from 'react-native-svg';
import { camera, photo, video } from '../../../../../core/assets/icons';

type AmityMediaAttachmentComponentType = {
  onPressCamera: () => void;
  onPressImage: () => void;
  onPressVideo: () => void;
  chosenMediaType?: mediaAttachment;
};

const AmityMediaAttachmentComponent: FC<AmityMediaAttachmentComponentType> = ({
  onPressCamera,
  onPressImage,
  onPressVideo,
  chosenMediaType,
}) => {
  const pageId = PageID.post_composer_page;
  const componentId = ComponentID.media_attachment;
  const { accessibilityId, themeStyles, isExcluded } = useAmityComponent({
    pageId,
    componentId,
  });
  const styles = useStyles(themeStyles);

  const animatedBottom = useRef(new Animated.Value(-100)).current;

  const showMediaAttachments = useCallback(() => {
    Animated.timing(animatedBottom, {
      toValue: 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [animatedBottom]);

  const hideMediaAttachments = useCallback(() => {
    Animated.timing(animatedBottom, {
      toValue: -100,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [animatedBottom]);

  useEffect(() => {
    showMediaAttachments();
    return () => hideMediaAttachments();
  }, [hideMediaAttachments, showMediaAttachments]);

  if (isExcluded) return null;
  return (
    <Animated.View
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
      style={[styles.container, { bottom: animatedBottom }]}
    >
      <View style={styles.handleBar} />
      <View style={styles.buttonsContainer}>
        <Pressable onPress={onPressCamera}>
          <View style={styles.iconContainer}>
            <SvgXml
              xml={camera()}
              width={24}
              height={24}
              color={themeStyles?.colors?.base}
            />
          </View>
        </Pressable>

        {(!chosenMediaType || chosenMediaType === mediaAttachment.image) && (
          <Pressable onPress={onPressImage}>
            <View style={styles.iconContainer}>
              <SvgXml
                xml={photo()}
                width={24}
                height={24}
                color={themeStyles?.colors?.base}
              />
            </View>
          </Pressable>
        )}
        {(!chosenMediaType || chosenMediaType === mediaAttachment.video) && (
          <Pressable onPress={onPressVideo}>
            <View style={styles.iconContainer}>
              <SvgXml
                xml={video()}
                width={24}
                height={24}
                color={themeStyles?.colors?.base}
              />
            </View>
          </Pressable>
        )}
        {/* //will use later
        <Pressable>
          <ImageKeyElement
            pageID={pageId}
            componentID={componentId}
            elementID={ElementID.file_button}
            style={styles.iconContainer}
          />
        </Pressable> */}
      </View>
    </Animated.View>
  );
};

export default memo(AmityMediaAttachmentComponent);
