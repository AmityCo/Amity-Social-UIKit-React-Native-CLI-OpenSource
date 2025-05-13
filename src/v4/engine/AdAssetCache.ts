import AsyncStorage from '@react-native-async-storage/async-storage';

export type AdAsset = {
  fileUrl: string;
  downloadStatus: number;
  downloadId: number | null;
};

class AdAssetCache {
  static #instance: AdAssetCache;

  private storageKey = 'amity.adAssetCache';
  private pendingRequests: { [key: string]: Promise<AdAsset> } = {};
  private memoryCache: { [key: string]: AdAsset } = {};
  private initialized = false;

  private async initialize() {
    if (this.initialized) return;

    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      if (data) {
        const assets = JSON.parse(data) as AdAsset[];
        assets.forEach((asset) => {
          this.memoryCache[asset.fileUrl] = asset;
        });
      }
      this.initialized = true;
    } catch (error) {
      console.warn('Error initializing AdAssetCache:', error);
    }
  }

  public static get instance(): AdAssetCache {
    if (!AdAssetCache.#instance) {
      AdAssetCache.#instance = new AdAssetCache();
      AdAssetCache.#instance.initialize();
    }

    return AdAssetCache.#instance;
  }

  // private async getAllAdAssetKey(): Promise<string[]> {
  //   const allKeys = await AsyncStorage.getAllKeys();
  //   return allKeys.filter((key) => key.startsWith(AdAssetCache.#adAssetPrefix));
  // }

  async getAllAdAssets(): Promise<AdAsset[]> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Return values from memory cache (much faster)
      return Object.values(this.memoryCache);
    } catch (error) {
      console.warn('Error getting all ad assets:', error);
      return [];
    }
  }

  async getAdAsset(fileUrl: string): Promise<AdAsset> {
    // Check memory cache first
    if (this.memoryCache[fileUrl]) {
      return this.memoryCache[fileUrl];
    }

    // Check if there's already a pending request for this asset
    if (this.pendingRequests[fileUrl]) {
      return this.pendingRequests[fileUrl];
    }

    // Make sure we're initialized
    if (!this.initialized) {
      await this.initialize();

      // Check again after initialization
      if (this.memoryCache[fileUrl]) {
        return this.memoryCache[fileUrl];
      }
    }

    // Create a new request promise
    this.pendingRequests[fileUrl] = this._fetchAdAsset(fileUrl);

    try {
      const result = await this.pendingRequests[fileUrl];
      return result;
    } finally {
      // Clean up the pending request
      delete this.pendingRequests[fileUrl];
    }
  }

  private async _fetchAdAsset(fileUrl: string): Promise<AdAsset> {
    try {
      // Get all assets (optimizes by batching reads)
      const assets = await this.getAllAdAssets();

      // Find matching asset
      const asset = assets.find((asset) => asset.fileUrl === fileUrl);

      if (asset) {
        // Cache it in memory
        this.memoryCache[fileUrl] = asset;
        return asset;
      }

      // Default asset if not found
      const defaultAsset: AdAsset = {
        fileUrl,
        downloadStatus: -1,
        downloadId: null,
      };

      this.memoryCache[fileUrl] = defaultAsset;
      return defaultAsset;
    } catch (error) {
      console.warn('Error fetching ad asset:', error);

      // Return default on error
      const defaultAsset: AdAsset = {
        fileUrl,
        downloadStatus: -1,
        downloadId: null,
      };

      return defaultAsset;
    }
  }

  async insertAdAsset(asset: AdAsset): Promise<void> {
    // Update memory cache immediately
    this.memoryCache[asset.fileUrl] = asset;

    try {
      // Update persistent storage in the background
      this._saveToStorage();
    } catch (error) {
      console.warn('Error inserting ad asset:', error);
    }
  }

  updateDownloadId(fileUrl: string, downloadId: number) {
    if (this.memoryCache[fileUrl]) {
      this.memoryCache[fileUrl].downloadId = downloadId;

      // Update storage in the background
      this._saveToStorage();
    }
  }

  updateDownloadStatus(fileUrl: string, status: number) {
    if (this.memoryCache[fileUrl]) {
      this.memoryCache[fileUrl].downloadStatus = status;

      // Update storage in the background
      this._saveToStorage();
    }
  }

  deleteAdAsset(fileUrl: string) {
    // Remove from memory cache
    delete this.memoryCache[fileUrl];

    // Update storage in the background
    this._saveToStorage();
  }

  async deleteAll() {
    // Clear memory cache
    this.memoryCache = {};

    // Clear storage
    try {
      await AsyncStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Error clearing ad asset cache:', error);
    }
  }

  private _saveTimeout: NodeJS.Timeout | null = null;
  private _saveToStorage(): void {
    if (this._saveTimeout) {
      clearTimeout(this._saveTimeout);
    }

    this._saveTimeout = setTimeout(async () => {
      try {
        const assets = Object.values(this.memoryCache);
        await AsyncStorage.setItem(this.storageKey, JSON.stringify(assets));
      } catch (error) {
        console.warn('Error saving ad assets to storage:', error);
      }
    }, 300); // 300ms debounce
  }
}

export default AdAssetCache;
