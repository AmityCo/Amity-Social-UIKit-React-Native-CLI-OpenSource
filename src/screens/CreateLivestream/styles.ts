import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    container: {
      height: '100%',
      backgroundColor: '#000000',
    },
    cameraContainer: {
      marginTop: '15%',
      height: '80%',
    },
    livestreamView: {
      flex: 1,
    },
    endingStreamWrap: {
      flex: 1,
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    endingStreamText: {
      color: '#FFFFFF',
    },
    streamingWrap: {
      flex: 1,
      position: 'absolute',
      width: '100%',
      height: '100%',
    },
    streamingTimerWrap: {
      alignSelf: 'center',
      backgroundColor: '#FF305A',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 20,
      left: 16,
    },
    streamingTimer: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '600',
      lineHeight: 18,
    },
    idleWrap: {
      flex: 1,
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    idleWraplInner: {
      padding: 16,
    },
    optionTopWrap: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
    },
    optionTopRightWrap: {
      flexDirection: 'row',
      gap: 10,
    },
    optionIcon: {
      flexDirection: 'row',
      borderRadius: 50,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      width: 32,
      height: 32,
    },
    optionIconInner: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    thumbnailImage: {
      width: 56,
      height: 32,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: '#FFFFFF',
    },
    postTarget: {
      marginTop: 36,
      flexDirection: 'row',
      alignItems: 'center',
      color: 'whites',
      gap: 6,
    },
    avatar: {
      width: 28,
      height: 28,
    },
    targetName: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
      lineHeight: 20,
    },
    seperator: {
      width: '100%',
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      marginTop: 16,
    },
    detailWrap: {
      marginTop: 28,
    },
    title: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: 'bold',
      height: 40,
      padding: 0,
    },
    description: {
      color: '#FFF',
      fontSize: 14,
      height: 40,
      padding: 0,
    },
    footer: {
      backgroundColor: '#000000',
      height: '10%',
    },
    streamingFooter: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },
    finishButton: {
      backgroundColor: 'transparent',
      borderColor: '#FFFFFF',
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 4,
      width: 75,
      height: 40,
    },
    finishButtonText: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    goLiveButton: {
      marginTop: 15,
      backgroundColor: '#FFFFFF',
      borderColor: '#A5A9B5',
      borderRadius: 4,
      height: 40,
      width: '90%',
      marginHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    goLiveButtonText: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '600',
      color: '#292B32',
    },
    actionSheetButton: {
      padding: 16,
    },
    actionSheetContainer: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 16,
      paddingBottom: 20,
    },
    actionSheetButtonNormalText: {
      color: '#292B32',
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 20,
    },
    actionSheetButtonDeleteText: {
      color: '#FA4D30',
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 20,
    },
  });

  return styles;
};
