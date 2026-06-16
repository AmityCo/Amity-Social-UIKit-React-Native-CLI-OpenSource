import { useCallback, useEffect, useState } from 'react';
import { AmityEventResponseStatus } from '@amityco/ts-sdk-react-native';
import { useToast } from '../../../../core/stores/slices/toastSlice';
import { EVENTS_STRINGS } from '../constants';

/**
 * Web parity: useRSVP — RSVP mutations through the event link object
 * (event.createRSVP / event.updateRSVP / event.getMyRSVP) with the same
 * success and error toasts as Web's useRSVP hook.
 */
export const useRSVP = ({ event }: { event?: Amity.Event }) => {
  const { showToast } = useToast();

  const createRSVP = useCallback(
    async (status: Amity.EventResponseStatus) => {
      try {
        return await event?.createRSVP(status);
      } catch (error) {
        showToast({ message: EVENTS_STRINGS.RSVP_FAILED, type: 'informative' });
        return undefined;
      }
    },
    [event, showToast]
  );

  const updateRSVP = useCallback(
    async (status: Amity.EventResponseStatus) => {
      try {
        const response = await event?.updateRSVP(status);
        if (response?.status === AmityEventResponseStatus.NotGoing) {
          showToast({ message: EVENTS_STRINGS.RSVP_UPDATED, type: 'success' });
        }
        return response;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('Cannot update RSVP for live events')
        ) {
          showToast({
            message: EVENTS_STRINGS.RSVP_LOCKED_LIVE,
            type: 'informative',
          });
        } else {
          showToast({
            message: EVENTS_STRINGS.RSVP_FAILED,
            type: 'informative',
          });
        }
        return undefined;
      }
    },
    [event, showToast]
  );

  const getMyRSVP = useCallback(async () => {
    try {
      return await event?.getMyRSVP();
    } catch {
      return undefined;
    }
  }, [event]);

  return { createRSVP, updateRSVP, getMyRSVP };
};

/**
 * Web parity: useEventDetail's myRSVP state — fetches the current user's RSVP
 * whenever the event resolves.
 */
export const useMyRSVP = ({
  event,
  shouldCall = true,
}: {
  event?: Amity.Event;
  shouldCall?: boolean;
}) => {
  const { getMyRSVP } = useRSVP({ event });
  const [myRSVP, setMyRSVP] = useState<Amity.EventResponse | undefined>(
    undefined
  );

  useEffect(() => {
    if (!event || !shouldCall) return undefined;
    let isMounted = true;
    getMyRSVP().then((rsvp) => {
      if (isMounted) setMyRSVP(rsvp ?? undefined);
    });
    return () => {
      isMounted = false;
    };
  }, [event, shouldCall, getMyRSVP]);

  return { myRSVP, setMyRSVP };
};
