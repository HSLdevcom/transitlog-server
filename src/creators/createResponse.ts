import { cacheFetch } from '../cache'
import { requireUser } from '../auth/requireUser'
import { AuthenticatedUser } from '../types/Authentication'
import { CachedFetcher } from '../types/CachedFetcher'

export async function createResponse<T = any>(
  dataFetcher: () => T,
  cacheKey: string,
  user?: AuthenticatedUser,
  requireGroups?: string[]
): Promise<T | null> {
  const fetchData: CachedFetcher<T> = async () => {
    const data: T = await dataFetcher()

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return false
    }

    return data
  }

  const isAuthorized = requireUser(user, requireGroups)

  if (requireGroups && !isAuthorized) {
    return null
  }

  const authCacheKey = `${cacheKey}_${isAuthorized ? 'authorized' : 'unauthorized'}`
  return cacheFetch<T>(authCacheKey, fetchData, 24 * 60 * 60)
}
