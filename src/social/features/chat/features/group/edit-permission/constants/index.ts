// Constants for the edit-group-member-permissions feature, ported from
// AmityUiKitWeb v4/chat/features/group/edit-permission/constants.
//
// Web imports `AmityChannelMessagingPermissionEnum` from `chat/hooks/queries`
// (defined alongside `useUpdateChannelMutePermissionQuery`). That query layer has
// no RN counterpart, so the enum is defined here and consumed by the RN hook.

export enum AmityChannelMessagingPermissionEnum {
  Everyone = 'everyone',
  ModeratorsOnly = 'moderatorsOnly',
}

export type MessagingPermissionOption = {
  value: AmityChannelMessagingPermissionEnum;
  titleKey: string;
  descriptionKey: string;
};

export const MESSAGING_PERMISSIONS: MessagingPermissionOption[] = [
  {
    value: AmityChannelMessagingPermissionEnum.Everyone,
    titleKey: 'amity_chat_group_edit_permissions_everyone_title',
    descriptionKey: 'amity_chat_group_edit_permissions_everyone_description',
  },
  {
    value: AmityChannelMessagingPermissionEnum.ModeratorsOnly,
    titleKey: 'amity_chat_group_edit_permissions_moderators_only_title',
    descriptionKey:
      'amity_chat_group_edit_permissions_moderators_only_description',
  },
];
