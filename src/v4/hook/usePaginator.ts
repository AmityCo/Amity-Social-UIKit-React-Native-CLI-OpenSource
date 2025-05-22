import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AdEngine } from '../engine/AdEngine';
import {
  useAdSettings,
  useRecommendAds,
} from '../../v4/providers/AdEngineProvider';

type ItemWithAd<T> = [T] | [T, Amity.Ad];

export const usePaginatorCore = <T>({
  placement,
  pageSize,
  communityId,
  getItemId,
  hasAppenedFirstRoundAdsState,
}: {
  placement: Amity.AdPlacement;
  pageSize: number;
  communityId?: string;
  getItemId: (item: T) => string;
  hasAppenedFirstRoundAdsState: [boolean, (value: boolean) => void]; // Pass state as a tuple
}) => {
  const adSettings = useAdSettings();

  const [adsLoaded, setAdsLoaded] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
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
    newItems: T[]
    hasAppenedAds = false
  ): number => {
    // TODO: check if we need to use hasAppenedAds
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
  const _processCombineItems = (newItems: T[]): Array<T | Amity.Ad> => {
    if (!adSettings?.enabled) {
      return newItems;
    }
    if (frequency?.type === 'fixed') {
      const newItemIds = new Set(newItems.map((item) => getItemId(item)));
      const prevItemWithAds: Array<ItemWithAd<T>> = updateExistingItems(
        newItems,
        newItemIds
      );

      const startItem = prevItemWithAds[0];
      // Find the index of the first item in newItems that matches the first item in prevItemWithAds
      // The prepending items are not count as the neweset items.
      const topIndex = calculateTopIndex(
        startItem,
        newItems,
        hasAppenedFirstRoundAds
      );

      const newestItems: Array<[T]> = (newItems || [])
        .slice(0, topIndex)
        .map((item) => [item]);

      const prevItems = [...newestItems, ...prevItemWithAds];

      // filteredNewItems is the newest items in the next page that are not in prevItems
      const filteredNewItems = filterNewItems(newItems, topIndex, prevItems);

      let runningAdIndex = currentAdIndex;
      let runningIndex = currentIndex;

      const suffixItems: Array<ItemWithAd<T>> = filteredNewItems.map(
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

      setHasAppenedFirstRoundAds(true);

      setCurrentAdIndex(runningAdIndex);
      setCurrentIndex(runningIndex);

      const newItemsWithAds = [...prevItems, ...suffixItems];

      updateItemWithAds(newItemsWithAds);

      if (newItemsWithAds.length === 0) {
        setCurrentAdIndex(0);
        setCurrentIndex(0);
      }

      const result = newItemsWithAds.flatMap((item) => item).filter(Boolean);
      return result;
    } else if (frequency?.type === 'time-window') {
      const newItemIds = new Set(newItems.map((item) => getItemId(item)));
      const prevItemWithAds = updateExistingItems(newItems, newItemIds);
      const startItem = prevItemWithAds[0];
      const topIndex = calculateTopIndex(startItem, newItems);
      const newestItems: Array<[T]> = (newItems || [])
        .slice(0, topIndex)
        .map((item) => [item]);

      const prevItems = [...newestItems, ...prevItemWithAds];
      const filteredNewItems = filterNewItems(newItems, topIndex, prevItems);
      const suffixItems: Array<ItemWithAd<T>> = filteredNewItems.map(
        (newItem, index) => {
          if (hasAppenedFirstRoundAds) {
            return [newItem];
          }

          let result;

          if (index === 0) {
            const ad = recommendedAdsRef.current[0];
            result = [newItem, ad];
          } else result = [newItem];

          return result;
        }
      );

      setHasAppenedFirstRoundAds(true);

      const newItemsWithAds = [...prevItems, ...suffixItems];

      updateItemWithAds(newItemsWithAds);

      const result = newItemsWithAds.flatMap((item) => item).filter(Boolean);
      return result;
    }
    return newItems;
  };

  const combineItemsWithAds = (newItems: T[]): Array<T | Amity.Ad> => {
    if (!adsLoaded) {
      return newItems;
    }

    return _processCombineItems(newItems);
  };

  const reset = useCallback(() => {
    setCurrentAdIndex(0);
    setAdsLoaded(false);
    resetRecommendedAds();
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
  isLoading?: boolean;
}) => {
  const [hasAppenedFirstRoundAds, setHasAppenedFirstRoundAds] = useState(false);

  const { items, ...rest } = params;
  const {
    combineItemsWithAds,
    adsLoaded,
    reset: coreReset,
  } = usePaginatorCore({
    ...rest,
    hasAppenedFirstRoundAdsState: [
      hasAppenedFirstRoundAds,
      setHasAppenedFirstRoundAds,
    ],
  });

  const reset = useCallback(() => {
    coreReset();
    setHasAppenedFirstRoundAds(false);
  }, [coreReset]);

  const itemWithAds = useMemo(() => {
    if (adsLoaded && !params.isLoading) return combineItemsWithAds(items);

    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, adsLoaded, params.isLoading]);

  return { itemWithAds, reset };
};
