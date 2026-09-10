// Timestamp util — ported from AmityUiKitWeb v4/chat/utils/timestamp.
// Formats a channel's last-activity timestamp as a compact relative string
// ("Now", "5m", "3h", "2d") falling back to a short date ("07 Jul" / "07 Jul 2024").
//
// Web adaptations: `navigator.language` (browser-only) is dropped — RN uses the
// runtime default locale via `Intl.DateTimeFormat(undefined, ...)` (supported by
// Hermes). The localized suffixes/labels resolve through the same
// `resolveString` API as web.

import dayjs from 'dayjs';
import { resolveString } from '../../core/localization';

function formatShortDate(date: Date, withYear: boolean): string {
  const day = new Intl.DateTimeFormat(undefined, { day: '2-digit' }).format(
    date
  );
  const month = new Intl.DateTimeFormat(undefined, { month: 'short' }).format(
    date
  );
  return withYear ? `${day} ${month} ${date.getFullYear()}` : `${day} ${month}`;
}

// formatMessageTime — ported from AmityUiKitWeb v4/chat/utils/formatMessageTime.
// A single message's time as 24-hour HH:MM (shown beside each bubble).
export function formatMessageTime(input: string | Date | number): string {
  const d = input instanceof Date ? input : new Date(input);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export function formatTimestamp(input: string | Date): string {
  const now = dayjs();
  const time = dayjs(input);
  const diffInSeconds = now.diff(time, 'second');
  const diffInMinutes = now.diff(time, 'minute');
  const diffInHours = now.diff(time, 'hour');
  const diffInDays = now.diff(time, 'day');

  if (diffInSeconds < 60) return resolveString('amity_chat_timestamp_now');
  if (diffInMinutes < 60)
    return `${diffInMinutes}${resolveString(
      'amity_common_time_time_minutes_suffix'
    )}`;
  if (diffInHours < 24)
    return `${diffInHours}${resolveString(
      'amity_common_time_time_hours_suffix'
    )}`;
  if (diffInDays < 7)
    return `${diffInDays}${resolveString(
      'amity_common_time_time_days_suffix'
    )}`;
  return formatShortDate(time.toDate(), !now.isSame(time, 'year'));
}
