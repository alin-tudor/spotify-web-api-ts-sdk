// src/services/cacheService.ts
import localforage from "localforage";

const CACHE_PREFIX = "spotify_cache_";

export const setCache = async (key: string, data: any, ttl: number) => {
  const expiry = Date.now() + ttl;
  const cacheData = { data, expiry };
  await localforage.setItem(CACHE_PREFIX + key, cacheData);
};

export const getCache = async (key: string) => {
  const cacheData = await localforage.getItem<{ data: any; expiry: number }>(
    CACHE_PREFIX + key
  );
  if (cacheData && cacheData.expiry > Date.now()) {
    return cacheData.data;
  }
  return null;
};

export const clearCache = async (key: string) => {
  await localforage.removeItem(CACHE_PREFIX + key);
};
