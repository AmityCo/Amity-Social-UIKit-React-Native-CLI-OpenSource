import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AdEngine } from '../engine/AdEngine';
import {
  useAdSettings,
  useRecommendAds,
} from '../../v4/providers/AdEngineProvider';

export const usePaginatorCore = <T>({
  placement,
  pageSize,
  communityId,
  getItemId,
}: {
  placement: Amity.AdPlacement;
  pageSize: number;
  communityId?: string;
  getItemId: (item: T) => string;
}) => {
  const adSettings = useAdSettings();

  const [adsLoaded, setAdsLoaded] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [itemWithAds, setItemWithAds] = useState<Array<[T] | [T, Amity.Ad]>>(
    []
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Add this ref to track items
  const itemWithAdsRef = useRef<Array<[T] | [T, Amity.Ad]>>([]);
  const [hasAppenedFirstRoundAds, setHasAppenedFirstRoundAds] =
    hasAppenedFirstRoundAdsState;

  // Modify your state update
  const updateItemWithAds = (items: Array<[T] | [T, Amity.Ad]>) => {
    itemWithAdsRef.current = items;
  };

  const updateExistingItems = (
    newItems: T[],
    newItemIds: Set<string>
  ): Array<ItemWithAd<T>> => {
    return (itemWithAdsRef.current || [])
      .map((itemWithAd) => {
        const itemId = getItemId(itemWithAd[0]);

        // Skip items not in new items list
        if (!newItemIds.has(itemId)) {
          return null;
        }

        // Find the updated version of this item
        const updatedItem = newItems.find(
          (newItem) => getItemId(newItem) === itemId
        );

        // Update the item while preserving its ad (if any)
        if (updatedItem) {
          if (itemWithAd.length === 1) {
            return [updatedItem] as [T];
          }
          return [updatedItem, itemWithAd[1]] as [T, Amity.Ad];
        }

        return itemWithAd;
      })
      .filter(Boolean) as Array<ItemWithAd<T>>;
  };

  const calculateTopIndex = (
    startItem: ItemWithAd<T> | undefined,
    newItems: T[],
    hasAppenedAds = false
  ): number => {
    // TODO: check if it is needed, when ad frequency is time-window for fixed for every 1 item
    // if (hasAppenedAds) return 1;

    if (!startItem) return 0;

    const foundedIndex = newItems.findIndex(
      (newItem) => getItemId(newItem) === getItemId(startItem[0])
    );

    return foundedIndex === -1 ? 0 : foundedIndex;
  };

  const filterNewItems = (
    newItems: T[],
    topIndex: number,
    prevItems: Array<ItemWithAd<T>>
  ): T[] => {
    return newItems.slice(topIndex).filter((newItem) => {
      const itemId = getItemId(newItem);
      return !prevItems.some(
        (prevItem) =>
          prevItem && prevItem[0] && getItemId(prevItem[0]) === itemId
      );
    });
  };

  const frequency = AdEngine.instance.getAdFrequencyByPlacement(placement);

  const count = (() => {
    if (frequency?.type === 'fixed') {
      return pageSize / frequency.value;
    }
    return 1;
  })();

  const { recommendedAds, resetRecommendedAds } = useRecommendAds({
    count,
    placement,
    communityId,
  });
  const recommendedAdsRef = useRef(recommendedAds);

  // Update ref and track when ads are loaded
  useEffect(() => {
    recommendedAdsRef.current = recommendedAds || [];

    // Mark as loaded when we have ads or explicitly know there are none
    if (recommendedAds !== undefined) {
      setAdsLoaded(true);
    }
  }, [recommendedAds]);

  // Internal function to process items once ads are loaded
  const _processCombineItems = useCallback(
    (newItems: T[]): Array<T | Amity.Ad> => {
      if (!adSettings?.enabled) {
        return newItems;
      }
      if (frequency?.type === 'fixed') {
        const newItemIds = new Set(newItems.map((item) => getItemId(item)));
        const prevItemWithAds: Array<[T] | [T, Amity.Ad]> = itemWithAds
          .map((itemWithAd) => {
            const itemId = getItemId(itemWithAd[0]);

            if (!newItemIds.has(itemId)) {
              return null;
            }

            const updatedItem = newItems.find(
              (newItem) => getItemId(newItem) === itemId
            );

            if (updatedItem) {
              if (itemWithAd.length === 1) {
                return [updatedItem] as [T];
              }
              return [updatedItem, itemWithAd[1]] as [T, Amity.Ad];
            }

            return itemWithAd;
          })
          .filter((item) => item != null) as Array<[T] | [T, Amity.Ad]>;

        const startItem = prevItemWithAds[0];

        const topIndex = (() => {
          if (startItem) {
            const foundedIndex = newItems.findIndex(
              (newItem) => getItemId(newItem) === getItemId(startItem[0])
            );
            if (foundedIndex === -1) {
              return 0;
            }
            return foundedIndex;
          }
          return 0;
        })();

        const newestItems: Array<[T]> = (newItems || [])
          .slice(0, topIndex)
          .map((item) => [item]);

        const prevItems = [...newestItems, ...prevItemWithAds];

        const filteredNewItems = newItems.slice(topIndex).filter((newItem) => {
          const itemId = getItemId(newItem);
          return !prevItems.some(
            (prevItem) => getItemId(prevItem[0]) === itemId
          );
        });

        let runningAdIndex = currentAdIndex;
        let runningIndex = currentIndex;

        const suffixItems: Array<[T] | [T, Amity.Ad]> = filteredNewItems.map(
          (newItem) => {
            runningIndex = runningIndex + 1; // 1
            const shouldPlaceAd = runningIndex % frequency.value === 0;

            if (!shouldPlaceAd) return [newItem];

            const ad = recommendedAdsRef.current[runningAdIndex];

            runningAdIndex =
              runningAdIndex + 1 > recommendedAdsRef.current.length - 1
                ? 0
                : runningAdIndex + 1;
            return [newItem, ad];
          }
        );
        setCurrentAdIndex(runningAdIndex);
        setCurrentIndex(runningIndex);

        const newItemsWithAds = [...prevItems, ...suffixItems];

        // Compare the new combined items with the current state
        setItemWithAds(newItemsWithAds);
        if (newItemsWithAds.length === 0) {
          setCurrentAdIndex(0);
          setCurrentIndex(0);
        }

        const result = newItemsWithAds.flatMap((item) => item).filter(Boolean);
        return result;
      } else if (frequency?.type === 'time-window') {
        if (newItems.length === 0) {
          return newItems;
        }
        return [
          ...newItems.slice(0, 1),
          recommendedAdsRef[0],
          ...newItems.slice(1),
        ].filter(Boolean);
      }
      return newItems;
    },
    [currentAdIndex, currentIndex, recommendedAdsRef, adSettings, frequency]
  );

  const combineItemsWithAds = useCallback(
    (newItems: T[]): Array<T | Amity.Ad> => {
      if (!adsLoaded) {
        return newItems; // Return items without ads for now
      }

      return _processCombineItems(newItems);
    },
    [adsLoaded, _processCombineItems]
  );

  const reset = useCallback(() => {
    setCurrentAdIndex(0);
    setAdsLoaded(false);
    resetRecommendedAds();
    setItemWithAds([]);
    setCurrentIndex(0);
    setHasAppenedFirstRoundAds(false);
    itemWithAdsRef.current = [];
    recommendedAdsRef.current = [];
  }, [resetRecommendedAds, setHasAppenedFirstRoundAds]);

  return { combineItemsWithAds, reset, adsLoaded };
};

export const usePaginatorApi = <T>(params: {
  items: T[];
  placement: Amity.AdPlacement;
  pageSize: number;
  communityId?: string;
  getItemId: (item: T) => string;
}) => {
  const { items, ...rest } = params;
  const { combineItemsWithAds, reset } = usePaginatorCore(rest);

  const itemWithAds = useMemo(
    () => combineItemsWithAds(items),
    [combineItemsWithAds, items]
  );

  return { itemWithAds, reset };
};
