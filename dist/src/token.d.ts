/**
 * access_token retrieval and caching
 */
/** Hash the cache key so appSecret is never stored as a plain-text Map key. @internal */
export declare function makeCacheKey(corpId: string, appSecret: string): string;
export declare function getAccessToken(corpId: string, appSecret: string): Promise<string>;
/** Clear cached token (e.g. on auth error) */
export declare function clearAccessToken(corpId: string, appSecret: string): void;
