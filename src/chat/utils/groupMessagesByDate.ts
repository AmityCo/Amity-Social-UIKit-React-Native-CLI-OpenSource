// groupMessagesByDate — ported from AmityUiKitWeb v4/chat/utils/groupMessagesByDate.
// Interleaves a date-separator item before each new calendar day's messages, so the
// MessageList can render "Mon, 21 Jul" dividers between days. Input must be in
// chronological (oldest → newest) order; the list reverses the result for its
// inverted FlatList. Web read navigator.language; RN uses the runtime default locale
// via Intl (Hermes-supported), matching utils/timestamp.

export type ChatItem =
  | { kind: 'date'; id: string; label: string }
  | { kind: 'message'; id: string; message: Amity.Message };

function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateLabel(date: Date): string {
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();
  const weekday = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
  }).format(date);
  const day = new Intl.DateTimeFormat(undefined, { day: '2-digit' }).format(
    date
  );
  const month = new Intl.DateTimeFormat(undefined, { month: 'short' }).format(
    date
  );
  const datePart =
    year === currentYear ? `${day} ${month}` : `${day} ${month} ${year}`;
  return `${weekday}, ${datePart}`;
}

/** messages MUST be chronological (oldest → newest). */
export function groupMessagesByDate(messages: Amity.Message[]): ChatItem[] {
  const items: ChatItem[] = [];
  let lastDate: Date | null = null;

  for (const message of messages) {
    const createdAt = message.createdAt ? new Date(message.createdAt) : null;
    if (!createdAt) continue;

    if (!lastDate || !sameCalendarDay(lastDate, createdAt)) {
      items.push({
        kind: 'date',
        id: `date-${createdAt.toISOString().slice(0, 10)}`,
        label: formatDateLabel(createdAt),
      });
    }

    items.push({
      kind: 'message',
      id:
        message.messageId ??
        (message as { uniqueId?: string }).uniqueId ??
        String(items.length),
      message,
    });

    lastDate = createdAt;
  }

  return items;
}
