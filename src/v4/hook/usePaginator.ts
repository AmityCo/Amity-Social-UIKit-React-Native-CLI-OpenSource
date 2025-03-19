import { useEffect, useRef, useState } from 'react';
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

  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [itemWithAds, setItemWithAds] = useState<Array<[T] | [T, Amity.Ad]>>(
    []
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const frequency = AdEngine.instance.getAdFrequencyByPlacement(placement);

  const count = (() => {
    if (frequency?.type === 'fixed') {
      return pageSize / frequency.value;
    }
    return 1;
  })();

  const recommendedAds = useRecommendAds({ count, placement, communityId });
  const recommendedAdsRef = useRef(recommendedAds);

  useEffect(() => {
    recommendedAdsRef.current = recommendedAds;
  }, [recommendedAds]);

  const combineItemsWithAds = async (
    newItems: T[]
  ): Promise<Array<T | Amity.Ad>> => {
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
        return !prevItems.some((prevItem) => getItemId(prevItem[0]) === itemId);
      });

      let runningAdIndex = currentAdIndex;
      let runningIndex = currentIndex;

      const suffixItemsPromises = filteredNewItems.map(async (newItem) => {
        runningIndex = runningIndex + 1;
        const shouldPlaceAd = runningIndex % frequency.value === 0;

        if (!shouldPlaceAd) return [newItem];

        const recommendAds = await AdEngine.instance.getRecommendedAds({
          placement,
          count,
          communityId,
        });

        const ad = recommendAds[runningAdIndex];

        runningAdIndex =
          runningAdIndex + 1 > recommendedAdsRef.current.length - 1
            ? 0
            : runningAdIndex + 1;
        return [newItem, ad];
      });

      const suffixItems = (await Promise.all(suffixItemsPromises)) as Array<
        [T] | [T, Amity.Ad]
      >;

      setCurrentAdIndex(runningAdIndex);
      setCurrentIndex(runningIndex);

      const newItemsWithAds = [...prevItems, ...suffixItems];

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
        recommendedAds[0],
        ...newItems.slice(1),
      ].filter(Boolean);
    }
    return newItems;
  };

  const reset = () => {
    setCurrentAdIndex(0);
    setItemWithAds([]);
    setCurrentIndex(0);
  };

  return { combineItemsWithAds, reset };
};

export const usePaginatorApi = <T>(params: {
  items: T[];
  placement: Amity.AdPlacement;
  pageSize: number;
  communityId?: string;
  getItemId: (item: T) => string;
}) => {
  const { items, ...rest } = params;
  const [itemWithAds, setItemWithAds] = useState<Array<T | Amity.Ad>>([]);
  const { combineItemsWithAds, reset } = usePaginatorCore(rest);

  useEffect(() => {
    combineItemsWithAds(items).then((result) => {
      setItemWithAds(result);
    });
  }, [items]);

  return { itemWithAds, reset };
};
