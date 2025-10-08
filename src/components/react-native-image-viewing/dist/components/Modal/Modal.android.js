/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import React, { useCallback, useEffect } from 'react';
import { BackHandler, View, StyleSheet, StatusBar } from 'react-native';
const Modal = ({ visible, children, presentationStyle, onRequestClose }) => {
  if (!visible) {
    return null;
  }

  const handleBackPress = useCallback(() => {
    if (typeof onRequestClose === 'function') {
      onRequestClose();
    }
    return true;
  }, [onRequestClose]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );
    return () => {
      backHandler.remove();
    };
  }, [handleBackPress]);
  const statusBarHidden = presentationStyle === 'overFullScreen';
  const statusBarStateStyle =
    presentationStyle === 'overFullScreen'
      ? styles.overFullscreen
      : styles.defaultStyle;
  return (
    <>
      {statusBarHidden && <StatusBar hidden />}
      <View style={[styles.root, statusBarStateStyle]}>{children}</View>
    </>
  );
};
const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  overFullscreen: {
    top: 0,
  },
  defaultStyle: {
    top: StatusBar.currentHeight,
  },
});
export default Modal;
