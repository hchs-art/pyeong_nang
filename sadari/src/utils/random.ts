// src/utils/random.ts

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 */
export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Picks `count` random unique items from the `items` array.
 */
export function pickRandom<T>(items: T[], count: number = 1): T[] {
    if (items.length === 0) return [];
    if (count >= items.length) return [...items];

    const shuffled = shuffleList(items);
    return shuffled.slice(0, count);
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * Returns a new array.
 */
export function shuffleList<T>(items: T[]): T[] {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
