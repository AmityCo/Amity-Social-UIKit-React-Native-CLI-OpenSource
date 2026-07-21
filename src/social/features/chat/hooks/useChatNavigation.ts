// useChatNavigation — RN adapter for AmityUiKitWeb's `useChatNavigation`
// (ChatNavigationProvider). Web keeps an in-memory page stack with push/pop/replace;
// RN delegates to React Navigation:
//   - `pop`  → navigation.goBack()
//   - `push` → navigation.navigate(...)
//
// useChatMessage consumes only `pop` (as `handleBack`). `push` is provided for
// parity; web's `push(page)` took a page-descriptor object, whereas RN's takes
// React Navigation route args — the orchestrator only relies on `pop`.

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../core/routes/RouteParamList';

type ChatNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type UseChatNavigationReturn = {
  pop: () => void;
  push: ChatNavigationProp['navigate'];
};

export function useChatNavigation(): UseChatNavigationReturn {
  const navigation = useNavigation<ChatNavigationProp>();

  function pop() {
    navigation.goBack();
  }

  return {
    pop,
    push: navigation.navigate,
  };
}
