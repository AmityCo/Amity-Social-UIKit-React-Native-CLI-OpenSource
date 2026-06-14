import {
  CreateProfile,
  CreateProfileProps,
} from '../../features/user/CreateProfile';

export type CreateUserProfilePageProps = CreateProfileProps;

// Unlike EditUserScreen, this page is rendered directly by the host (e.g. in
// visitor mode) and driven by props, mirroring the Web UIKit's
// AmityCreateProfilePage usage — not by a navigation route.
export function CreateUserProfileScreen(props: CreateUserProfilePageProps) {
  return <CreateProfile {...props} />;
}

// AmityPageRenderer derives its navigator's initialRouteName from the wrapped
// component's displayName. This must match the pass-through route registered
// for this page in AmityPageRenderer, otherwise React Navigation throws
// "Couldn't find a screen named '...' to use as 'initialRouteName'".
CreateUserProfileScreen.displayName = 'AmityCreateUserProfilePage';
