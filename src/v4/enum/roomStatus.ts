export const RoomStatus = {
  idle: 'idle',
  live: 'live',
  recorded: 'recorded',
  ended: 'ended',
  waitingReconnect: 'waitingReconnect',
} as const satisfies Record<Amity.RoomStatus, Amity.RoomStatus>;
