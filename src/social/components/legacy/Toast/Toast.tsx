import { StyleSheet, Text, Animated, ActivityIndicator } from 'react-native';
import { FC, memo, useEffect, useRef } from 'react';
import uiSlice from '../../../../core/stores/slices/uiSlice';
import {
  RootState,
  useUIKitDispatch,
  useUIKitSelector,
} from '../../../../core/stores/store';
import { toastIcon, toastSuccess } from '../../../../core/assets/icons/xml';
import { SvgXml } from 'react-native-svg';

const Toast: FC = () => {
  const dispatch = useUIKitDispatch();
  const { hideToastMessage } = uiSlice.actions;
  const { toastMessage, showToastMessage, isLoadingToast, isSuccessToast } =
    useUIKitSelector((state: RootState) => state.ui);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<number | null>(null);
  useEffect(() => {
    if (showToastMessage) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: isLoadingToast ? 2500 : 500,
        useNativeDriver: false,
      }).start(() => {
        timeoutRef.current = setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: isLoadingToast ? 2500 : 500,
            useNativeDriver: false,
          }).start(() => {
            dispatch(hideToastMessage());
          });
        }, 2000);
      });
    }

    return () => {
      fadeAnim.setValue(0);
      fadeAnim.stopAnimation();
      clearTimeout(timeoutRef.current);
    };
  }, [dispatch, fadeAnim, hideToastMessage, isLoadingToast, showToastMessage]);

  const styles = StyleSheet.create({
    toastContainer: {
      width: '90%',
      position: 'absolute',
      bottom: 100,
      backgroundColor: '#292b32',
      borderRadius: 16,
      padding: 16,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    message: {
      lineHeight: 24,
      flex: 1,
      marginLeft: 4,
      color: '#ffffff',
    },
    toastVisible: {
      opacity: 1,
    },
    loadingIndicator: {
      marginRight: 5,
    },
  });

  if (!showToastMessage) return null;
  return (
    <Animated.View style={[styles.toastContainer, styles.toastVisible]}>
      {isLoadingToast ? (
        <ActivityIndicator
          style={styles.loadingIndicator}
          animating={isLoadingToast}
          color="lightblue"
          size="small"
        />
      ) : isSuccessToast ? (
        <SvgXml xml={toastSuccess()} width="24" height="24" />
      ) : (
        <SvgXml xml={toastIcon()} width="24" height="24" />
      )}
      <Text style={styles.message}>{toastMessage}</Text>
    </Animated.View>
  );
};

export default memo(Toast);
