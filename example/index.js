import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import { startNetworkLogging } from 'react-native-network-logger';

startNetworkLogging();

AppRegistry.registerComponent(appName, () => App);
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Message handled in the background!', remoteMessage);
});
