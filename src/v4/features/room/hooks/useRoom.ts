import { useEffect, useState } from 'react';
import { RoomRepository } from '@amityco/ts-sdk-react-native';

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Amity.Room>(null);

  useEffect(() => {
    let unsubscribe: () => void;
    if (roomId) {
      unsubscribe = RoomRepository.getRoom(roomId, ({ data }) => {
        setRoom(data);
      });
    }
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [roomId]);

  return room;
}
