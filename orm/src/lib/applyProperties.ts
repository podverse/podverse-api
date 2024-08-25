export function applyProperties<T>(target: T, source: Partial<T>): T {
  Object.keys(source).forEach(key => {
    const value = source[key as keyof T];
    if (value !== undefined) {
      target[key as keyof T] = value;
    }
  });
  return target;
}
