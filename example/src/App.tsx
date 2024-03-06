import * as React from 'react';
import {
  AmityUiKitProvider,
  AmityUiKitSocial,
} from 'amity-react-native-social-ui-kit';

export default function App() {
  return (
    <AmityUiKitProvider
      apiKey="b0efe90c3bdda2304d628918520c1688845889e4bc363d2c" // Put your apiKey
      apiRegion="staging" // Put your apiRegion
      userId="Peak" // Put your UserId
      displayName="Peak" // Put your displayName
      apiEndpoint="https://api.staging.amity.co" //"https://api.{apiRegion}.amity.co"
    >
      <AmityUiKitSocial />
    </AmityUiKitProvider>
  );
}
