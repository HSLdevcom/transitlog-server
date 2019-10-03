// The cached fetcher fetches items, processes them and returns them. If no items
// were found, the fetcher should return false to skip caching the result.

export type CachedFetcher<ReturnType = any> = (...args: any[]) => Promise<ReturnType | false>
