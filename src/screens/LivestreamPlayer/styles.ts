import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#000000',
      flex: 1,
    },
    topSectionWrap: {
      position: 'absolute',
      top: 60,
      display: 'flex',
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      zIndex: 1,
    },
    status: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: '#FF305A',
      borderRadius: 5,
      zIndex: 1,
    },
    statusText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    controller: {
      position: 'absolute',
      bottom: 60,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      zIndex: 100,
    },
    controllerButton: {
      borderColor: '#FFFFFF',
      borderRadius: 10,
      borderWidth: 1,
      width: 60,
      flexDirection: 'row',
      justifyContent: 'center',
    },
  });

  return styles;
};
