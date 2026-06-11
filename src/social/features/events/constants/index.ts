import { AmityEventStatus, AmityEventType } from '@amityco/ts-sdk-react-native';

/**
 * English defaults copied verbatim from the Web UIKit localization file
 * (src/v4/core/localization/defaults/en.json) so both platforms render the
 * exact same copy. Keys are referenced in comments for traceability.
 */
export const EVENTS_STRINGS = {
  // amity_social_button_social_home_events_button
  EVENTS: 'Events',
  // amity_social_tab_tab_explore
  TAB_EXPLORE: 'Explore',
  // amity_social_tab_tab_my_events
  TAB_MY_EVENTS: 'My event',
  // amity_social_label_recommended_for_you
  RECOMMENDED_FOR_YOU: 'Recommended for you',
  // amity_social_button_view_all
  VIEW_ALL: 'View all',
  // amity_social_button_happening_now
  HAPPENING_NOW: 'Happening now',
  // amity_social_status_event_feed_upcoming
  UPCOMING: 'Upcoming',
  // amity_social_button_event_feed_past
  PAST: 'Past',
  // amity_social_label_no_events_yet
  NO_EVENTS_YET: 'No events yet',
  // amity_social_status_upcoming_events
  UPCOMING_EVENTS: 'Upcoming events',
  // amity_social_button_past_events
  PAST_EVENTS: 'Past events',
  // amity_common_button_all / amity_social_tab_tab_all
  TAB_ALL: 'All',
  // amity_social_tab_tab_hosting
  TAB_HOSTING: 'Hosting',
  // amity_social_button_attendees
  ATTENDEES: 'Attendees',
  // amity_social_button_starts
  STARTS: 'Starts',
  // amity_social_button_event_type
  EVENT_TYPE: 'Event type',
  // amity_social_button_hosted_by
  HOSTED_BY: 'Hosted by',
  // amity_social_button_by_creator ("By %s")
  BY_CREATOR: (name: string) => `By ${name}`,
  // amity_social_status_set_up_live_stream
  SET_UP_LIVE_STREAM: 'Set up live stream',
  // amity_social_button_rsvp
  RSVP: 'RSVP',
  // amity_social_button_going
  GOING: 'Going',
  // amity_social_button_not_going
  NOT_GOING: 'Not going',
  // amity_social_label_about_the_event
  ABOUT_THE_EVENT: 'About the event',
  // amity_social_placeholder_event_link_hint
  EVENT_LINK: 'Event link',
  // amity_social_status_live_stream
  LIVE_STREAM: 'Live stream',
  // amity_social_event_info_event_address
  EVENT_ADDRESS: 'Event Address',
  // amity_social_status_you_can_start_setting_up_live_15_minutes_before_the_eve
  LIVE_SETUP_HINT:
    'You can start setting up live 15 minutes before the event starts.',
  // amity_social_button_copy
  COPY: 'Copy',
  // amity_social_button_link_copied
  LINK_COPIED: 'Link copied.',
  // amity_social_button_address_copied
  ADDRESS_COPIED: 'Address copied.',
  // amity_social_failed_to_copy_link
  FAILED_TO_COPY_LINK: 'Failed to copy link',
  // amity_social_button_edit_event
  EDIT_EVENT: 'Edit event',
  // amity_social_button_delete_event
  DELETE_EVENT: 'Delete event',
  // amity_social_delete_this_event
  DELETE_THIS_EVENT: 'Delete this event?',
  // amity_social_modal_dialog_delete_event_description
  DELETE_EVENT_DESCRIPTION:
    'This event will be permanently deleted. You and others will no longer see and find this event.',
  // amity_social_button_delete
  DELETE: 'Delete',
  // amity_social_button_cancel
  CANCEL: 'Cancel',
  // amity_social_button_ok
  OK: 'OK',
  // amity_social_toast_snackbar_event_deleted
  EVENT_DELETED: 'Event deleted.',
  // amity_social_toast_snackbar_delete_event_failed
  DELETE_EVENT_FAILED: 'Failed to delete event. Please try again.',
  // amity_social_label_editing_is_not_possible
  EDITING_NOT_POSSIBLE: 'Editing is not possible',
  // amity_social_label_you_can_no_longer_edit_this_event_changes_are_restricte
  EDITING_NOT_POSSIBLE_DESCRIPTION:
    'You can no longer edit this event. Changes are restricted 15 minutes before the start time.',
  // amity_social_modal_add_calendar_sheet_description
  ADD_CALENDAR_DESCRIPTION:
    "You can also keep track of this event by adding it to your device's calendar.",
  // Headline hardcoded on Web (MemberBottomSheet.tsx)
  YOU_WILL_BE_NOTIFIED: 'You’ll be notified.',
  // amity_social_join_community_to_continue
  JOIN_COMMUNITY_TO_CONTINUE: 'Join community to continue',
  // amity_social_label_join_to_attend_events ("Become a member of %s …")
  JOIN_TO_ATTEND_EVENTS: (communityName: string) =>
    `Become a member of ${communityName} to attend events and join the conversation.`,
  // amity_social_join_community
  JOIN_COMMUNITY: 'Join community',
  // amity_social_join_community_and_rsvp
  JOIN_COMMUNITY_AND_RSVP: 'Join Community And Rsvp',
  // amity_social_label_rsvp_after_join
  RSVP_AFTER_JOIN: "You'll be able to RSVP once your join request is accepted",
  // amity_social_modal_dialog_join_request_sent
  JOIN_REQUEST_SENT:
    "Requested to join the community. You'll be notified once your request is accepted.",
  // amity_social_failed_to_update_your_attending_status_please_try_again
  RSVP_FAILED: 'Failed to update your attending status. Please try again.',
  // amity_social_your_attending_status_cannot_be_changed_once_the_e
  RSVP_LOCKED_LIVE:
    'Your attending status cannot be changed once the event has started.',
  // amity_social_toast_snackbar_attending_status_updated
  RSVP_UPDATED: 'Successfully updated your attending status.',
  // amity_social_empty_feed_no_posts — Web renders this default verbatim
  EMPTY_DISCUSSION: 'Empty Feed No Posts',
  // amity_social_label_community_post_label
  POST: 'Post',
  // amity_social_button_poll
  POLL: 'Poll',
  // amity_social_label_select_event_target_title
  SELECT_EVENT_TARGET_TITLE: 'Create event in',
  // amity_social_button_event_name
  EVENT_NAME: 'Event name',
  // amity_social_label_name_your_event
  NAME_YOUR_EVENT: 'Name your event',
  // amity_social_button_event_details
  EVENT_DETAILS: 'Event details',
  // amity_social_share_what_this_event_is_all_about
  EVENT_DETAILS_PLACEHOLDER: 'Share what this event is all about',
  // amity_social_label_date_and_time
  DATE_AND_TIME: 'Date and time',
  // amity_social_label_event_location_title
  EVENT_LOCATION: 'Location',
  // amity_social_button_event_setup_starts_on
  STARTS_ON: 'Starts on',
  // amity_social_button_event_setup_ends_on
  ENDS_ON: 'Ends on',
  // amity_social_label_event_time
  EVENT_TIME: 'Time',
  // amity_social_label_event_select_location
  SELECT_LOCATION: 'Select where this event will be happening',
  // amity_social_label_enter_address_of_where_this_event_will_be_happening
  ENTER_ADDRESS: 'Enter address of where this event will be happening',
  // amity_social_event_platform
  PLATFORM: 'Platform',
  // amity_social_label_event_platform_external
  PLATFORM_EXTERNAL: 'External platform',
  // amity_social_label_event_platform_external_description
  PLATFORM_EXTERNAL_DESCRIPTION:
    'Users will join the event on an external platform.',
  // amity_social_label_event_platform_livestream_description
  PLATFORM_LIVESTREAM_DESCRIPTION:
    'Users can join the live stream on the app or website.',
  // amity_social_time_event_without_specified_end_time_will_end_after_12_hour
  NO_END_TIME_HINT: 'Event without specified end time will end after 12 hours.',
  // amity_social_button_create_event
  CREATE_EVENT: 'Create event',
  // amity_social_button_community_setup_edit_button
  SAVE: 'Save',
  // amity_social_creating
  CREATING: 'Creating...',
  // amity_social_saving
  SAVING: 'Saving...',
  // amity_social_toast_snackbar_event_created
  EVENT_CREATED: 'Successfully created event.',
  // amity_social_toast_snackbar_create_event_failed
  CREATE_EVENT_FAILED: 'Failed to create event. Please try again.',
  // amity_social_toast_snackbar_event_updated
  EVENT_UPDATED: 'Successfully updated event.',
  // amity_social_toast_snackbar_update_event_failed
  UPDATE_EVENT_FAILED: 'Failed to update event. Please try again.',
  // amity_social_toast_event_create_start_time_too_soon_error
  CREATE_START_TIME_TOO_SOON:
    "Your event wasn't created as it needs to start at least 15 minutes from now.",
  // amity_social_toast_event_update_start_time_too_soon_error
  UPDATE_START_TIME_TOO_SOON:
    "Your event wasn't updated as it needs to start at least 15 minutes from now.",
  // amity_social_toast_event_create_blocked_word_error
  CREATE_BLOCKED_WORD:
    "Your event wasn't created as it contains an inappropriate word.",
  // amity_social_toast_event_create_blocked_url_error
  CREATE_BLOCKED_URL:
    "Your event wasn't created as it contains a link that's not allowed.",
  // amity_social_toast_event_update_blocked_word_error
  UPDATE_BLOCKED_WORD:
    "Your event wasn't updated as it contains an inappropriate word.",
  // amity_social_toast_event_update_blocked_url_error
  UPDATE_BLOCKED_URL:
    "Your event wasn't updated as it contains a link that's not allowed.",
  // amity_social_modal_dialog_title_leave_without_finishing
  LEAVE_WITHOUT_FINISHING: 'Leave without finishing?',
  // amity_social_button_leave
  LEAVE: 'Leave',
  // amity_social_button_event_progress_not_saved
  PROGRESS_NOT_SAVED:
    "Your progress won't be saved and your event won't be created.",
  // amity_social_button_event_unsaved_changes
  UNSAVED_CHANGES: 'Your changes that you made may not be saved.',
  // amity_social_button_host
  HOST: 'Host',
  // amity_social_button_my_communities
  MY_COMMUNITIES: 'My Communities',
} as const;

// Web: STATUS_LABEL (src/v4/social/features/events/constants/index.ts)
export const EVENT_STATUS_LABEL: Record<string, string> = {
  // amity_social_status_event_detail_header_status_upcoming
  [AmityEventStatus.Scheduled]: 'Upcoming',
  // amity_social_button_happening_now
  [AmityEventStatus.Live]: 'Happening now',
  // amity_social_event_detail_status_ended
  [AmityEventStatus.Ended]: 'Ended',
  // amity_social_button_event_detail_header_status_cancelled
  [AmityEventStatus.Cancelled]: 'Cancelled',
};

// Web: EVENT_TYPE (src/v4/social/features/events/constants/index.ts)
export const EVENT_TYPE_LABEL: Record<string, string> = {
  // amity_social_label_event_type_in_person
  [AmityEventType.InPerson]: 'In-person',
  // amity_social_label_event_type_virtual
  [AmityEventType.Virtual]: 'Virtual',
};
