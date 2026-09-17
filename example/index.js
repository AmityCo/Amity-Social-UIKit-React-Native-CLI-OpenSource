import { AppRegistry } from 'react-native';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import App from './src/App';
import { name as appName } from './app.json';
import { startNetworkLogging } from 'react-native-network-logger';

startNetworkLogging();

// The Login and Select Module screens render before AmityUiKitProvider mounts,
// so they are outside the provider the UIKit sets up for itself. Their
// SafeAreaView then reads zero insets and paints under the status bar — on a
// Dynamic Island device the title sits behind the island. Providing the metrics
// here covers every screen, before and after login; initialWindowMetrics seeds
// the first frame so nothing jumps once the real measurement arrives.
function Root() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <App />
    </SafeAreaProvider>
  );
}

AppRegistry.registerComponent(appName, () => Root);
