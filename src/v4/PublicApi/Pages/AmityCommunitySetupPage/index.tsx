import React from 'react';
import CreateCommunity from '~/v4/features/community/Create';
import EditCommunity from '~/v4/features/community/Edit';

export enum AmityCommunitySetupPageMode {
  CREATE = 'create',
  EDIT = 'edit',
}

type CreateCommunityProps = {
  mode: AmityCommunitySetupPageMode.CREATE;
};

type EditCommunityProps = {
  mode: AmityCommunitySetupPageMode.EDIT;
  community: Amity.Community;
};

export type CommunityMember = {
  userId: string;
  displayName: string;
};

export type AmityCommunitySetupPageProps =
  | CreateCommunityProps
  | EditCommunityProps;

const isCreatePage = (
  props: AmityCommunitySetupPageProps
): props is CreateCommunityProps => {
  return props.mode === AmityCommunitySetupPageMode.CREATE;
};

function AmityCommunitySetupPage(props: AmityCommunitySetupPageProps) {
  return isCreatePage(props) ? (
    <CreateCommunity />
  ) : (
    <EditCommunity community={props.community} />
  );
}

export default AmityCommunitySetupPage;
