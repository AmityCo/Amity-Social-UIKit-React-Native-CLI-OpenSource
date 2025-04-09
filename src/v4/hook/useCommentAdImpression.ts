import { useCallback, useEffect, useState } from 'react';
import { ViewToken } from 'react-native';
import AdEngine from '../engine/AdEngine';
import { isAmityAd } from './useCustomRankingGlobalFeed';

export const useCommentAdImpression = () => {
  const [commentsView, setCommentsView] = useState<ViewToken[]>([]);

  const handleViewChange = useCallback(({ viewableItems }) => {
    setCommentsView([...viewableItems]);
  }, []);

  useEffect(() => {
    if (commentsView.length > 0) {
      for (const viewableComment of commentsView) {
        if (!isAmityAd(viewableComment.item)) return;
        AdEngine.instance.markSeen(
          viewableComment.item,
          'comment' as Amity.AdPlacement
        );
      }
    }
  }, [commentsView]);

  return {
    handleViewChange,
  };
};
