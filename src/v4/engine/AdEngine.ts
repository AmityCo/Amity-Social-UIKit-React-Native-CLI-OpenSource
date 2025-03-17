import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Client as ASCClient,
  AdRepository,
} from '@amityco/ts-sdk-react-native';
import { TimeWindowTracker } from './TimeWindowTracker';

class SeenRecencyCache {
  static #instance: SeenRecencyCache;
  #persistentCacheKey = 'amity.seenRecencyCache';

  constructor() {}

  public static get instance(): SeenRecencyCache {
    if (!SeenRecencyCache.#instance) {
      SeenRecencyCache.#instance = new SeenRecencyCache();
    }
    return SeenRecencyCache.#instance;
  }

  private async getSeenRecencyCache() {
    return JSON.parse(
      (await AsyncStorage.getItem(this.#persistentCacheKey)) || '{}'
    );
  }

  getSeenRecencyByAdId(adId?: string): number | undefined {
    if (!adId) return;
    return this.getSeenRecencyCache()[adId];
  }

  async setSeenRecencyCache(adId: string, value: number) {
    const seenRecencyCache = this.getSeenRecencyCache();
    seenRecencyCache[adId] = value;
    await AsyncStorage.setItem(
      this.#persistentCacheKey,
      JSON.stringify(seenRecencyCache)
    );
  }
}

export class AdEngine {
  static #instance: AdEngine;

  private isLoading = true;
  private ads: Amity.Ad[] = [];
  private settings: Amity.AdsSettings | null = null;

  private subscribers: Array<(networkAds: Amity.NetworkAds | null) => void> =
    [];

  private constructor() {
    ASCClient.onSessionStateChange(async (state: Amity.SessionStates) => {
      if (state === 'established') {
        await this.consumeNetworkAds();
      } else if (state === 'terminated') {
        this.clearAllCache();
      }
    });
  }

  public static get instance(): AdEngine {
    if (!AdEngine.#instance) {
      AdEngine.#instance = new AdEngine();
    }
    return AdEngine.#instance;
  }

  onNetworkAdsData(callback: (networkAds: Amity.NetworkAds | null) => void) {
    if (!this.isLoading && this.ads.length > 0 && this.settings) {
      callback({ ads: this.ads, settings: this.settings });
    }
    this.subscribers.push(callback);
  }

  private clearAllCache() {
    this.ads = [];
    this.settings = null;
    TimeWindowTracker.instance.clear();
    // AssetSyncEngine.cancelAllDownload();
    // AssetSyncEngine.removeAllAssets();
    // assetDB.clear();
    // adRecencyDB.clear();
    this.subscribers.forEach((subscriber) => subscriber(null));
  }

  private async consumeNetworkAds() {
    const networkAds = await AdRepository.getNetworkAds();

    this.ads = networkAds.ads;
    this.settings = networkAds.settings;
    this.subscribers.forEach((subscriber) => subscriber(networkAds));
    // Reomove unused Asset fileIds[]
    // AssetSyncEngine.getInstance().removeUnusedAssets(fileIds)
    // this.subscribers.forEach((subscriber) => subscriber(null));
  }

  private getAdFrequency(placement: Amity.AdPlacement) {
    if (!this.settings) return null;
    switch (placement) {
      case 'feed':
        return this.settings.frequency.feed;
      case 'comment':
        return this.settings.frequency.comment;
      case 'story':
        return this.settings.frequency.story;
      default:
        return null;
    }
  }

  getLastSeen(adId?: string) {
    return SeenRecencyCache.instance.getSeenRecencyByAdId(adId);
  }

  markClicked(ad: Amity.Ad, placement: Amity.AdPlacement) {
    ad.analytics.markLinkAsClicked(placement);
  }

  markSeen(ad: Amity.Ad, placement: Amity.AdPlacement) {
    // update recency seen time as now
    SeenRecencyCache.instance.setSeenRecencyCache(ad.adId, Date.now());
    if (this.getAdFrequency(placement)?.type === 'time-window') {
      TimeWindowTracker.instance.markSeen(placement);
    }
    ad.analytics.markAsSeen(placement);
  }

  getAdFrequencyByPlacement(placement: Amity.AdPlacement) {
    return this.getAdFrequency(placement);
  }
}

export default AdEngine;
