// Styles for ScrollToLatestButton — positioning only. The 40×40 filled/secondary
// circle (container + surface + states) is owned by the Button.Icon atom; this
// pins it bottom-right (web .scrollToLatestButton: right 1rem→16, bottom 0.5rem→8).
// box-shadow dropped (RN, no hex allowed).

import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    button: {
      position: 'absolute',
      right: 16,
      bottom: 8,
    },
  });

  return { styles };
};
