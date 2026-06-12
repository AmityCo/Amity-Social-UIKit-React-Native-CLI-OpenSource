export const RoomStatus = {
  idle: 'idle',
  live: 'live',
  recorded: 'recorded',
  ended: 'ended',
  waitingReconnect: 'waitingReconnect',
  terminated: 'terminated',
  error: 'error',
} as const satisfies Record<Amity.RoomStatus, Amity.RoomStatus>;
