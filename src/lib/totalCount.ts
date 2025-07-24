/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Helper to calculate total count for paginated results.
 * If null is returned, the front end handles it as if there are more pages
 * than the pagination component will display (ex. 1 2 3 4 5)
 * When a number is returned, the pagination component can accurately display
 * how many pages there are.
 */
export async function calculateTotalCountWithIds<T>(
  getManyFn: (ids: number[] | [], config: any) => Promise<T[]>,
  config: any,
  offset: number,
  limit: number
): Promise<number | null> {
  const results = await getManyFn([], config);
  if (results.length < limit) {
    return offset + results.length;
  } else {
    const nextConfig = {
      ...config,
      skip: offset + limit,
      take: limit * 2
    };
    const nextResults = await getManyFn([], nextConfig);
    if (nextResults.length < (limit * 2)) {
      return offset + results.length + nextResults.length;
    }
  }
  return null;
}

export async function calculateTotalCount<T>(
  getManyFn: (config: any) => Promise<T[]>,
  config: any,
  offset: number,
  limit: number
): Promise<number | null> {
  const results = await getManyFn(config);
  if (results.length < limit) {
    return offset + results.length;
  } else {
    const nextConfig = {
      ...config,
      skip: offset + limit,
      take: limit * 2
    };
    const nextResults = await getManyFn(nextConfig);
    if (nextResults.length < (limit * 2)) {
      return offset + results.length + nextResults.length;
    }
  }
  return null;
}
