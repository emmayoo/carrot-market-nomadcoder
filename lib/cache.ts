/* eslint-disable @typescript-eslint/no-explicit-any */
type Callback<T, A extends unknown[]> = (...args: A) => T;
type CacheData<T> = {
  value: T;
  timestamp?: number;
  callback: Callback<T, any[]>; // 콜백 저장
  args: any[]; // 콜백에 전달된 인수 저장
};

const cache = new Map<string, CacheData<any>>();
const tagMap = new Map<string, Set<string>>();

export function getCachedData<T, A extends unknown[]>(
  cb: Callback<T, A>,
  key: string[],
  tags: string[] = []
) {
  console.log(cb, key, tags);
  // 래퍼 함수 생성
  return async (...args: A): Promise<T> => {
    const cacheKey = JSON.stringify(key);

    // 캐시에 데이터가 있는 경우 반환
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!.value;
    }

    // 데이터가 없으면 cb (callback) 호출
    const data = await cb(...args);
    cache.set(cacheKey, {
      value: data,
      timestamp: Date.now(),
      callback: cb,
      args,
    });

    // 태그와 캐시 키 연결
    tags.forEach((tag) => {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, new Set());
      }
      tagMap.get(tag)?.add(cacheKey);
    });

    return data;
  };
}

export async function revalidateTag(tagName: string): Promise<void> {
  const keysToInvalidate = tagMap.get(tagName) || [];

  // 태그와 연결된 캐시들을 갱신
  for (const cacheKey of keysToInvalidate) {
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      const { callback, args } = cachedData; // 캐시된 callback과 인수 불러오기
      const newData = await callback(...args); // 새로운 데이터로 갱신
      cache.set(cacheKey, {
        value: newData,
        timestamp: Date.now(),
        callback,
        args,
      }); // 캐시 업데이트
    }
  }
}
