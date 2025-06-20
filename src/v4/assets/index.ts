import { Image } from 'react-native';

const defaultAvatar = require('./images/userAvatar.png');
const defaultCommunityAvatar = require('./images/communityAvatar.png');
const defaultAdAvatar = require('./images/adAvatar.png');

export const defaultAvatarUri = Image.resolveAssetSource(defaultAvatar).uri;
export const defaultCommunityAvatarUri = Image.resolveAssetSource(
  defaultCommunityAvatar
).uri;

export const defaultAdAvatarUri = Image.resolveAssetSource(defaultAdAvatar).uri;
