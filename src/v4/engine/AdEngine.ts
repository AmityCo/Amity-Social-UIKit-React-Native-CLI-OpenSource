import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Client as ASCClient,
  AdRepository,
} from '@amityco/ts-sdk-react-native';
import { TimeWindowTracker } from './TimeWindowTracker';
import AdAssetCache, { AdAsset } from './AdAssetCache';
import AssetDownloader, { DownloadStatus } from './AssetDownloader';

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

  async clear() {
    await AsyncStorage.removeItem(this.#persistentCacheKey);
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

  private async clearAllCache() {
    this.ads = [];
    this.settings = null;

    const allAssets = await AdAssetCache.instance.getAllAdAssets();
    for (const asset of allAssets) {
      AssetDownloader.instance.deleteFile(asset.fileUrl);
    }

    AdAssetCache.instance.deleteAll();
    SeenRecencyCache.instance.clear();
    TimeWindowTracker.instance.clear();

    this.subscribers.forEach((subscriber) => subscriber(null));
  }

  private async consumeNetworkAds() {
    const networkAds = await AdRepository.getNetworkAds();

    this.ads = networkAds.ads;
    this.settings = networkAds.settings;

    await this.diffAssets(this.generateAssets(this.ads));
    await this.refreshDownloadStatuses();

    this.subscribers.forEach((subscriber) => subscriber(networkAds));
  }

  private generateAssets(ads: Amity.Ad[]): AdAsset[] {
    const assets = ads
      .flatMap(
        (ad) =>
          [ad?.image1_1?.fileUrl, ad?.image9_16?.fileUrl].filter(
            Boolean
          ) as string[]
      )
      .map((url) => ({
        fileUrl: url + '?size=large',
        downloadStatus: -1,
        downloadId: null,
      }));
    return assets;
  }

  private async diffAssets(newAsset: AdAsset[]) {
    const oldAssets = await AdAssetCache.instance.getAllAdAssets();

    const newAssetUrls = newAsset.map((asset) => asset.fileUrl);

    const assetToInsert = newAsset.filter(
      (asset) =>
        !oldAssets.some((oldAsset) => oldAsset.fileUrl === asset.fileUrl)
    );
    const assetToDelete = oldAssets.filter(
      (oldAsset) => !newAssetUrls.includes(oldAsset.fileUrl)
    );

    assetToDelete.forEach((asset) => {
      AdAssetCache.instance.deleteAdAsset(asset.fileUrl);
    });

    assetToInsert.forEach((asset) => {
      AdAssetCache.instance.insertAdAsset(asset);
    });
  }

  private async refreshDownloadStatuses() {
    const assets = await AdAssetCache.instance.getAllAdAssets();

    for (const asset of assets) {
      if (
        asset.downloadStatus === -1 ||
        asset.downloadStatus === DownloadStatus.FAILED
      ) {
        try {
          const instance = AssetDownloader.instance;
          console.log('instance: ', instance);
          const downloadId = await AssetDownloader.instance.enqueue(
            asset.fileUrl
          );

          // Listen to download status, to update the status when it changes
          AssetDownloader.instance.addStatusListener(
            asset.fileUrl,
            (status) => {
              AdAssetCache.instance.updateDownloadStatus(
                downloadId.toString(),
                status
              );
            }
          );

          AdAssetCache.instance.updateDownloadId(asset.fileUrl, downloadId);
          AdAssetCache.instance.updateDownloadStatus(
            downloadId.toString(),
            DownloadStatus.DOWNLOADING
          );
        } catch (e) {
          console.log('error: ', e);
        }
      } else if (asset.downloadStatus !== DownloadStatus.COMPLETED) {
        AdAssetCache.instance.updateDownloadStatus(
          asset.downloadId.toString(),
          AssetDownloader.instance.getDownloadStatus(asset.downloadId)
        );
      }
    }
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
