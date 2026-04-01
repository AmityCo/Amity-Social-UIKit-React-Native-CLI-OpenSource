import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './RouteParamList';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

type Notification = {
  [T in keyof RootStackParamList]: {
    name: T;
    params: RootStackParamList[T];
  };
}[keyof RootStackParamList];

let notification: Notification | null = null;

export function navigate<T extends keyof RootStackParamList>(
  name: T,
  params: RootStackParamList[T]
) {
  if (navigationRef.isReady()) {
    (navigationRef.navigate as typeof navigate)(name, params);
  } else {
    notification = { name, params } as Notification;
  }
}

export function onNavigationReady() {
  if (notification && navigationRef.isReady()) {
    (navigationRef.navigate as typeof navigate)(
      notification.name,
      notification.params
    );
    notification = null;
  }
}
