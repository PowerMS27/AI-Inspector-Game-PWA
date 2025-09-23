export default function useRandomItems() {
  /**
   * get one random item from array
   * @param items array to take random item from
   * @param filterField optional flter
   */
  const getRandomItem = <T>(
    items: T[],
    filterField?: keyof T
  ): T | undefined => {
    const filtered = filterField
      ? items.filter((item) => Boolean(item[filterField]))
      : [...items];

    if (!filtered.length) return undefined;

    return filtered[Math.floor(Math.random() * filtered.length)];
  };

  /**
   * get array of random items from array
   * @param items array to take random items from
   * @param count number of random items to take
   * @param filterField optional flter
   * @param unique is only unique items
   */
  const getRandomItems = <T>(
    items: T[],
    count: number,
    filterField?: keyof T,
    unique = true
  ): T[] => {
    if (count <= 0) return [];

    const filtered = filterField
      ? items.filter((item) => Boolean(item[filterField]))
      : [...items];

    if (!filtered.length) return [];

    // if more items then in array
    if (count > filtered.length) {
      return unique
        ? filtered
        : Array.from({ length: count }, () => {
            const index = Math.floor(Math.random() * filtered.length);
            return filtered[index] as T;
          });
    }

    const result: T[] = [];
    const source = [...filtered];

    while (result.length < count && source.length > 0) {
      const randomIndex = Math.floor(Math.random() * source.length);
      const item = source[randomIndex];
      result.push(item as T);

      if (unique) {
        source.splice(randomIndex, 1);
      }
    }

    return result;
  };

  return { getRandomItem, getRandomItems };
}
