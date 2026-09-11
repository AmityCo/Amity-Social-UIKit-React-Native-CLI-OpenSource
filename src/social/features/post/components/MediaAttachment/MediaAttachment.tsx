import { Pressable, View, Animated, Easing } from 'react-native';
import { FC, memo, useCallback, useEffect, useRef } from 'react';
import {
  PageID,
  ComponentID,
  ElementID,
  mediaAttachment,
} from '../../../../enums';
import { useAmityComponent, useAmityElement } from '../../../../hooks';
import { useStyles } from './styles';
import { SvgXml } from 'react-native-svg';
import { camera, photo, video } from '../../../../../core/assets/icons';

type AmityMediaAttachmentComponentType = {
  onPressCamera: () => void;
  onPressImage: () => void;
  onPressVideo: () => void;
  chosenMediaType?: mediaAttachment;
  onHeightChange?: (height: number) => void;
  /** When the 10-attachment cap is reached, the camera + gallery icons are
   * disabled and untappable (PDT-4310 / PDT-4312). */
  disabled?: boolean;
};

const AmityMediaAttachmentComponent: FC<AmityMediaAttachmentComponentType> = ({
  onPressCamera,
  onPressImage,
  onPressVideo,
  chosenMediaType,
  onHeightChange,
  disabled = false,
}) => {
  const pageId = PageID.post_composer_page;
  const componentId = ComponentID.media_attachment;
  const { accessibilityId, themeStyles, isExcluded } = useAmityComponent({
    pageId,
    componentId,
  });
  const cameraElement = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.camera_button,
  });
  const imageElement = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.image_button,
  });
  const videoElement = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.video_button,
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
      onLayout={(e) => onHeightChange?.(e.nativeEvent.layout.height)}
    >
      <View style={styles.handleBar} />
      <View style={styles.buttonsContainer}>
        {!cameraElement.isExcluded && (
          <Pressable
            testID={cameraElement.accessibilityId}
            accessibilityLabel={cameraElement.accessibilityId}
            onPress={onPressCamera}
            disabled={disabled}
          >
            <View style={[styles.iconContainer, disabled && { opacity: 0.4 }]}>
              <SvgXml
                xml={camera()}
                width={24}
                height={24}
                color={themeStyles?.colors?.base}
              />
            </View>
          </Pressable>
        )}

        {!imageElement.isExcluded &&
          (!chosenMediaType || chosenMediaType === mediaAttachment.image) && (
            <Pressable
              testID={imageElement.accessibilityId}
              accessibilityLabel={imageElement.accessibilityId}
              onPress={onPressImage}
              disabled={disabled}
            >
              <View
                style={[styles.iconContainer, disabled && { opacity: 0.4 }]}
              >
                <SvgXml
                  xml={photo()}
                  width={24}
                  height={24}
                  color={themeStyles?.colors?.base}
                />
              </View>
            </Pressable>
          )}
        {!videoElement.isExcluded &&
          (!chosenMediaType || chosenMediaType === mediaAttachment.video) && (
            <Pressable
              testID={videoElement.accessibilityId}
              accessibilityLabel={videoElement.accessibilityId}
              onPress={onPressVideo}
              disabled={disabled}
            >
              <View
                style={[styles.iconContainer, disabled && { opacity: 0.4 }]}
              >
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
