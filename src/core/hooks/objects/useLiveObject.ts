import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';

function useLiveObject<TParams, TCallback, TConfig>({
  fetcher,
  params,
  callback = () => {},
  options,
  enabled = true,
}: {
  fetcher: (
    params: TParams,
    callback: Amity.LiveObjectCallback<TCallback>,
    options?: Amity.LiveObjectOptions<TConfig>
  ) => Amity.Unsubscriber;
  params: TParams;
  callback?: Amity.LiveObjectCallback<TCallback>;
  options?: Amity.LiveObjectOptions<TConfig>;
  enabled?: boolean;
}) {
  const [item, setItem] = useState<TCallback | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeRef = useRef<Amity.Unsubscriber | null>(null);

  const callbackFnRef = useRef<Amity.LiveObjectCallback<TCallback>>(null);
  callbackFnRef.current = (response) => {
    if (!enabled) return undefined;
    if (params == null) return undefined;
    setIsLoading(response.loading);
    if (response.data) setItem(response.data);
    setError(response.error);
    callback(response);
  };

  const stableCallback = useCallback<Amity.LiveObjectCallback<TCallback>>(
    (response) => {
      callbackFnRef.current?.(response);
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return undefined;

      const { unsubscribe } = subscribe({
        fetcher,
        params,
        callback: stableCallback,
        options,
      });

      return () => unsubscribe();
    }, [JSON.stringify(params), enabled])
  );

  const refresh = () => {
    if (unsubscribeRef.current) unsubscribeRef.current();

    const { unsubscribe } = subscribe({
      fetcher,
      params,
      callback: stableCallback,
      options,
    });

    unsubscribeRef.current = unsubscribe;

    return () => unsubscribe();
  };

  return {
    item,
    isLoading,
    error,
    refresh,
  };
}

export default useLiveObject;

const subscribe = <TParams, TCallback, TConfig>({
  fetcher,
  params,
  callback,
  options,
}: {
  fetcher: (
    params: TParams,
    callback: Amity.LiveObjectCallback<TCallback>,
    options?: Amity.LiveObjectOptions<TConfig>
  ) => Amity.Unsubscriber;
  params: TParams;
  callback: Amity.LiveObjectCallback<TCallback>;
  options?: Amity.LiveObjectOptions<TConfig>;
}) => {
  const unsubscribe = fetcher(
    params,
    (response) => callback(response),
    options
  );
  return { unsubscribe };
};
