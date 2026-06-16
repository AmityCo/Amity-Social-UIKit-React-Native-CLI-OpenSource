import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(isYesterday);

// Web parity: formatDateTimeLocal in src/v4/social/utils/timezone.ts renders
// "05 Jun 2026, 14:30" (2-digit day, short month, year, 24h time).
const formatDateTimeLocal = (date: string | Date) =>
  dayjs(date).format('DD MMM YYYY, HH:mm');

/**
 * Web parity: formatEventDuration (src/v4/social/utils/timezone.ts) resolved
 * against the en.json templates, e.g. "Today, %1$s to %2$s".
 */
export function formatEventDuration(start: string, end?: string): string {
  const startTime = dayjs(start).format('HH:mm');

  const endTime = end
    ? dayjs(start).isSame(dayjs(end), 'day')
      ? dayjs(end).format('HH:mm')
      : formatDateTimeLocal(end)
    : '';

  if (dayjs(start).isToday()) return `Today, ${startTime} to ${endTime}`;
  if (dayjs(start).isTomorrow()) return `Tomorrow, ${startTime} to ${endTime}`;
  if (dayjs(start).isYesterday())
    return `Yesterday, ${startTime} to ${endTime}`;

  return end
    ? `${formatDateTimeLocal(start)} to ${endTime}`
    : formatDateTimeLocal(start);
}

/**
 * Web parity: checkIsWithinMinutes — true when `date` is less than `minutes`
 * away (or already past). Gates event editing and live-stream setup.
 */
export function checkIsWithinMinutes(date: string, minutes = 15) {
  return dayjs(date).valueOf() - Date.now() < minutes * 60 * 1000;
}

/**
 * Web parity: millify(rsvpCount) — abbreviates 1200 → "1.2K", 3400000 → "3.4M".
 */
export function millify(value: number): string {
  if (!value || value < 1000) return `${value ?? 0}`;
  const units = [
    { threshold: 1e9, suffix: 'B' },
    { threshold: 1e6, suffix: 'M' },
    { threshold: 1e3, suffix: 'K' },
  ];
  const unit = units.find((u) => value >= u.threshold);
  if (!unit) return `${value}`;
  const scaled = value / unit.threshold;
  const rounded = Math.round(scaled * 10) / 10;
  return `${rounded % 1 === 0 ? Math.round(rounded) : rounded}${unit.suffix}`;
}
