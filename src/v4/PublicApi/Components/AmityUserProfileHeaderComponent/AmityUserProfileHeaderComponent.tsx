import React, { memo } from 'react';
import { View } from 'react-native';
import { PageID, ComponentID } from '~/v4/enum/enumUIKitID';
import Info from '~/v4/features/user/Profile/components/Info';
import { useAmityComponent } from '~/v4/hook';

type AmityUserProfileHeaderComponentProps = {
  pageId?: PageID;
  userId: string;
};

const AmityUserProfileHeaderComponent = ({
  pageId,
  userId,
}: AmityUserProfileHeaderComponentProps) => {
  const componentId = ComponentID.user_profile_header;
  const { isExcluded, accessibilityId } = useAmityComponent({
    pageId,
    componentId,
  });

  if (isExcluded) return null;

  return (
    <View testID={accessibilityId}>
      <Info pageId={pageId} componentId={componentId} userId={userId} />
    </View>
  );
};

export default memo(AmityUserProfileHeaderComponent);
