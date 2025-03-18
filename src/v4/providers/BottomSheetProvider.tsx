import React, {
  useContext,
  useEffect,
  useState,
  createContext,
  PropsWithChildren,
  ReactNode,
} from 'react';
import { AdEngine } from '../engine/AdEngine';
import { AdSupplier } from '../engine/AdSupplier';
import { TimeWindowTracker } from '../engine/TimeWindowTracker';

export const BottomSheetContext = createContext<{
  bottomSheet: ReactNode | null;
  setBottomSheet: (content: ReactNode | null) => void;
}>({
  bottomSheet: null,
  setBottomSheet: () => {},
});

export const BottomSheetProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [bottomSheet, setBottomSheet] = useState<ReactNode | null>(null);

  const getItemsPaginationCache = ({
    targetId,
    placement,
    frequencyType,
  }: {
    targetId?: string;
    placement: string;
    frequencyType: string;
  }) => {
    const cacheKey = getCacheKey({ targetId, placement, frequencyType });
    return itemsPaginationCache.get(cacheKey);
  };

  useEffect(() => {
    async function init() {
      AdEngine.instance.onNetworkAdsData((networkAds) => {
        setNetworkAds(networkAds);
        setIsLoading(false);
      });
    }
    init();
  }, []);

  return (
    <AdEngineContext.Provider
      value={{
        isLoading,
        ads: networkAds?.ads || [],
        settings: networkAds?.settings || null,
        saveItemsPagination,
        getItemsPaginationCache,
      }}
    >
      {children}
    </AdEngineContext.Provider>
  );
};

export const useAds = () => {
  const adContext = useContext(AdEngineContext);
  return adContext.ads;
};

export const useAdSettings = () => {
  const adContext = useContext(AdEngineContext);
  return adContext.settings;
};

export const useRecommendAds = ({
  count,
  placement,
  communityId,
}: {
  count: number;
  placement: Amity.AdPlacement;
  communityId?: string;
}) => {
  const adContext = useContext(AdEngineContext);
  const ads = adContext.ads;
  const [recommendedAds, setRecommendedAds] = useState<Amity.Ad[]>([]);
  const adSettings = useAdSettings();
  const adFrequency = AdEngine.instance.getAdFrequencyByPlacement(placement);

  useEffect(() => {
    if (!adSettings?.enabled) {
      return;
    }
    if (
      adFrequency?.type === 'time-window' &&
      TimeWindowTracker.instance.hasReachedLimit(placement)
    ) {
      return;
    }

    setRecommendedAds(
      AdSupplier.instance.recommendedAds({
        ads,
        placement,
        count,
        communityId,
      })
    );
  }, [ads, count, placement, communityId, adFrequency, adSettings]);

  return recommendedAds;
};
