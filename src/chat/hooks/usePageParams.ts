import { useRoute, type RouteProp } from '@react-navigation/native';

import type { RootStackParamList } from '../../core/routes/RouteParamList';

/**
 * A chat page's input, from wherever the page was opened.
 *
 * Reached through the chat navigator, a page reads its route params. Rendered
 * standalone inside `AmityPageRenderer`, it is the stack's first screen and has
 * no params, so its input arrives as props instead.
 */
export function usePageParams<RouteName extends keyof RootStackParamList>(
  props: Partial<RootStackParamList[RouteName]>
): RootStackParamList[RouteName] {
  const { params } = useRoute<RouteProp<RootStackParamList, RouteName>>();
  return (params ?? props) as RootStackParamList[RouteName];
}
