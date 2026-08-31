import { Animated, Easing, Pressable, View } from 'react-native';
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
import TextKeyElement from '../../../../elements/TextKeyElement/TextKeyElement';

type AmityDetailedMediaAttachmentComponentType = {
  onPressCamera: () => void;
  onPressImage: () => void;
  onPressVideo: () => void;
  chosenMediaType?: mediaAttachment;
  onHeightChange?: (height: number) => void;
  /** When the 10-attachment cap is reached, the camera + gallery icons are
   * disabled and untappable (PDT-4310 / PDT-4312). */
  disabled?: boolean;
};

const AmityDetailedMediaAttachmentComponent: FC<
  AmityDetailedMediaAttachmentComponentType
> = ({
  onPressCamera,
  onPressImage,
  onPressVideo,
  chosenMediaType,
  onHeightChange,
  disabled = false,
}) => {
  const pageId = PageID.post_composer_page;
  const componentId = ComponentID.detailed_media_attachment;
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

  const animatedBottom = useRef(new Animated.Value(-200)).current;

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
      toValue: -200,
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
            style={[styles.mediaAttachmentBtn, disabled && { opacity: 0.4 }]}
            onPress={onPressCamera}
            disabled={disabled}
          >
            <View style={styles.iconContainer}>
              <SvgXml
                xml={camera()}
                width={24}
                height={24}
                color={themeStyles?.colors?.base}
              />
            </View>
            <TextKeyElement
              pageID={pageId}
              componentID={componentId}
              elementID={ElementID.camera_button}
              style={styles.iconText}
            />
          </Pressable>
        )}
        {!imageElement.isExcluded &&
          (!chosenMediaType || chosenMediaType === mediaAttachment.image) && (
            <Pressable
              testID={imageElement.accessibilityId}
              accessibilityLabel={imageElement.accessibilityId}
              style={[styles.mediaAttachmentBtn, disabled && { opacity: 0.4 }]}
              onPress={onPressImage}
              disabled={disabled}
            >
              <View style={styles.iconContainer}>
                <SvgXml
                  xml={photo()}
                  width={24}
                  height={24}
                  color={themeStyles?.colors?.base}
                />
              </View>
              <TextKeyElement
                pageID={pageId}
                componentID={componentId}
                elementID={ElementID.image_button}
                style={styles.iconText}
              />
            </Pressable>
          )}
        {!videoElement.isExcluded &&
          (!chosenMediaType || chosenMediaType === mediaAttachment.video) && (
            <Pressable
              testID={videoElement.accessibilityId}
              accessibilityLabel={videoElement.accessibilityId}
              style={[styles.mediaAttachmentBtn, disabled && { opacity: 0.4 }]}
              onPress={onPressVideo}
              disabled={disabled}
            >
              <View style={styles.iconContainer}>
                <SvgXml
                  xml={video()}
                  width={24}
                  height={24}
                  color={themeStyles?.colors?.base}
                />
              </View>
              <TextKeyElement
                pageID={pageId}
                componentID={componentId}
                elementID={ElementID.video_button}
                style={styles.iconText}
              />
            </Pressable>
          )}
        {/* will use later
        <Pressable style={styles.mediaAttachmentBtn}>
          <ImageKeyElement
            pageID={pageId}
            componentID={componentId}
            elementID={ElementID.file_button}
            style={styles.iconContainer}
          />
          <TextKeyElement
            pageID={pageId}
            componentID={componentId}
            elementID={ElementID.file_button}
            style={styles.iconText}
          />
        </Pressable> */}
      </View>
    </Animated.View>
  );
};

export default memo(AmityDetailedMediaAttachmentComponent);
