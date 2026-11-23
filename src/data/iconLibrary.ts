import { IconCategoryFilter, IconCategoryKey, MemorySymbol } from '../types/memora';

export const CATEGORY_LABELS: Record<IconCategoryFilter, string> = {
  all: 'All Categories Mix',
  everyday: 'Everyday Objects',
  food: 'Food & Fruits',
  nature: 'Nature',
  animals: 'Animals',
  travel: 'Travel & Places',
  technology: 'Technology',
  sports: 'Sports',
  lifestyle: 'Fun & Lifestyle',
};

export const ICON_LIBRARY: MemorySymbol[] = [
  // Category 1: Everyday Objects
  { id: 'ev-apple', label: 'Apple', emoji: '🍎', category: 'everyday', accent: '#FF5D78' },
  { id: 'ev-coffee', label: 'Coffee Cup', emoji: '☕', category: 'everyday', accent: '#D99B66' },
  { id: 'ev-bottle', label: 'Water Bottle', emoji: '🧴', category: 'everyday', accent: '#55D9FF' },
  { id: 'ev-keys', label: 'Keys', emoji: '🔑', category: 'everyday', accent: '#FBBF24' },
  { id: 'ev-backpack', label: 'Backpack', emoji: '🎒', category: 'everyday', accent: '#F87171' },
  { id: 'ev-watch', label: 'Watch', emoji: '⌚', category: 'everyday', accent: '#9B7BFF' },
  { id: 'ev-sunglasses', label: 'Sunglasses', emoji: '🕶️', category: 'everyday', accent: '#527BFF' },
  { id: 'ev-umbrella', label: 'Umbrella', emoji: '☂️', category: 'everyday', accent: '#A78BFA' },
  { id: 'ev-wallet', label: 'Wallet', emoji: '👛', category: 'everyday', accent: '#F472B6' },
  { id: 'ev-camera', label: 'Camera', emoji: '📷', category: 'everyday', accent: '#60A5FA' },
  { id: 'ev-headphones', label: 'Headphones', emoji: '🎧', category: 'everyday', accent: '#55D9FF' },
  { id: 'ev-book', label: 'Book', emoji: '📖', category: 'everyday', accent: '#37D99A' },
  { id: 'ev-lamp', label: 'Lamp', emoji: '💡', category: 'everyday', accent: '#FDE047' },
  { id: 'ev-clock', label: 'Clock', emoji: '⏰', category: 'everyday', accent: '#FB7185' },
  { id: 'ev-bicycle', label: 'Bicycle', emoji: '🚲', category: 'everyday', accent: '#38BDF8' },
  { id: 'ev-shoes', label: 'Shoes', emoji: '👟', category: 'everyday', accent: '#818CF8' },

  // Category 2: Food and Fruits
  { id: 'fd-apple', label: 'Red Apple', emoji: '🍎', category: 'food', accent: '#FF5D78' },
  { id: 'fd-banana', label: 'Banana', emoji: '🍌', category: 'food', accent: '#FACC15' },
  { id: 'fd-orange', label: 'Orange', emoji: '🍊', category: 'food', accent: '#FB923C' },
  { id: 'fd-strawberry', label: 'Strawberry', emoji: '🍓', category: 'food', accent: '#F43F5E' },
  { id: 'fd-watermelon', label: 'Watermelon', emoji: '🍉', category: 'food', accent: '#37D99A' },
  { id: 'fd-pizza', label: 'Pizza', emoji: '🍕', category: 'food', accent: '#F59E0B' },
  { id: 'fd-burger', label: 'Burger', emoji: '🍔', category: 'food', accent: '#FBBF24' },
  { id: 'fd-donut', label: 'Donut', emoji: '🍩', category: 'food', accent: '#F472B6' },
  { id: 'fd-icecream', label: 'Ice Cream', emoji: '🍦', category: 'food', accent: '#67E8F9' },
  { id: 'fd-cake', label: 'Cake', emoji: '🎂', category: 'food', accent: '#FB7185' },
  { id: 'fd-coffee', label: 'Hot Coffee', emoji: '☕', category: 'food', accent: '#D99B66' },
  { id: 'fd-milk', label: 'Milk', emoji: '🥛', category: 'food', accent: '#E2E8F0' },
  { id: 'fd-sandwich', label: 'Sandwich', emoji: '🥪', category: 'food', accent: '#FCD34D' },
  { id: 'fd-popcorn', label: 'Popcorn', emoji: '🍿', category: 'food', accent: '#FDE047' },

  // Category 3: Nature
  { id: 'nt-sun', label: 'Sun', emoji: '☀️', category: 'nature', accent: '#FBBF24' },
  { id: 'nt-moon', label: 'Moon', emoji: '🌙', category: 'nature', accent: '#A78BFA' },
  { id: 'nt-star', label: 'Star', emoji: '⭐', category: 'nature', accent: '#FACC15' },
  { id: 'nt-cloud', label: 'Cloud', emoji: '☁️', category: 'nature', accent: '#93C5FD' },
  { id: 'nt-rainbow', label: 'Rainbow', emoji: '🌈', category: 'nature', accent: '#55D9FF' },
  { id: 'nt-flower', label: 'Flower', emoji: '🌸', category: 'nature', accent: '#F472B6' },
  { id: 'nt-tree', label: 'Tree', emoji: '🌳', category: 'nature', accent: '#37D99A' },
  { id: 'nt-leaf', label: 'Leaf', emoji: '🍃', category: 'nature', accent: '#4ADE80' },
  { id: 'nt-butterfly', label: 'Butterfly', emoji: '🦋', category: 'nature', accent: '#38BDF8' },
  { id: 'nt-mountain', label: 'Mountain', emoji: '⛰️', category: 'nature', accent: '#94A3B8' },
  { id: 'nt-ocean', label: 'Ocean Wave', emoji: '🌊', category: 'nature', accent: '#55D9FF' },
  { id: 'nt-mushroom', label: 'Mushroom', emoji: '🍄', category: 'nature', accent: '#FB7185' },
  { id: 'nt-cactus', label: 'Cactus', emoji: '🌵', category: 'nature', accent: '#34D399' },
  { id: 'nt-snowflake', label: 'Snowflake', emoji: '❄️', category: 'nature', accent: '#7DD3FC' },

  // Category 4: Animals
  { id: 'an-cat', label: 'Cat', emoji: '🐱', category: 'animals', accent: '#FBBF24' },
  { id: 'an-dog', label: 'Dog', emoji: '🐶', category: 'animals', accent: '#F59E0B' },
  { id: 'an-panda', label: 'Panda', emoji: '🐼', category: 'animals', accent: '#E2E8F0' },
  { id: 'an-lion', label: 'Lion', emoji: '🦁', category: 'animals', accent: '#FB923C' },
  { id: 'an-elephant', label: 'Elephant', emoji: '🐘', category: 'animals', accent: '#94A3B8' },
  { id: 'an-fox', label: 'Fox', emoji: '🦊', category: 'animals', accent: '#F97316' },
  { id: 'an-rabbit', label: 'Rabbit', emoji: '🐰', category: 'animals', accent: '#F9A8D4' },
  { id: 'an-penguin', label: 'Penguin', emoji: '🐧', category: 'animals', accent: '#60A5FA' },
  { id: 'an-owl', label: 'Owl', emoji: '🦉', category: 'animals', accent: '#A78BFA' },
  { id: 'an-turtle', label: 'Turtle', emoji: '🐢', category: 'animals', accent: '#37D99A' },
  { id: 'an-dolphin', label: 'Dolphin', emoji: '🐬', category: 'animals', accent: '#55D9FF' },
  { id: 'an-octopus', label: 'Octopus', emoji: '🐙', category: 'animals', accent: '#FB7185' },
  { id: 'an-giraffe', label: 'Giraffe', emoji: '🦒', category: 'animals', accent: '#FACC15' },
  { id: 'an-frog', label: 'Frog', emoji: '🐸', category: 'animals', accent: '#4ADE80' },

  // Category 5: Travel and Places
  { id: 'tr-airplane', label: 'Airplane', emoji: '✈️', category: 'travel', accent: '#55D9FF' },
  { id: 'tr-car', label: 'Car', emoji: '🚗', category: 'travel', accent: '#FF5D78' },
  { id: 'tr-bus', label: 'Bus', emoji: '🚌', category: 'travel', accent: '#FACC15' },
  { id: 'tr-train', label: 'Train', emoji: '🚆', category: 'travel', accent: '#60A5FA' },
  { id: 'tr-ship', label: 'Ship', emoji: '🚢', category: 'travel', accent: '#38BDF8' },
  { id: 'tr-suitcase', label: 'Suitcase', emoji: '🧳', category: 'travel', accent: '#A78BFA' },
  { id: 'tr-passport', label: 'Passport', emoji: '🛂', category: 'travel', accent: '#527BFF' },
  { id: 'tr-globe', label: 'Globe', emoji: '🌍', category: 'travel', accent: '#37D99A' },
  { id: 'tr-tent', label: 'Tent', emoji: '⛺', category: 'travel', accent: '#FB923C' },
  { id: 'tr-compass', label: 'Compass', emoji: '🧭', category: 'travel', accent: '#FBBF24' },

  // Category 6: Technology
  { id: 'tc-laptop', label: 'Laptop', emoji: '💻', category: 'technology', accent: '#55D9FF' },
  { id: 'tc-phone', label: 'Mobile Phone', emoji: '📱', category: 'technology', accent: '#60A5FA' },
  { id: 'tc-keyboard', label: 'Keyboard', emoji: '⌨️', category: 'technology', accent: '#9B7BFF' },
  { id: 'tc-mouse', label: 'Mouse', emoji: '🖱️', category: 'technology', accent: '#94A3B8' },
  { id: 'tc-controller', label: 'Game Controller', emoji: '🎮', category: 'technology', accent: '#9B7BFF' },
  { id: 'tc-robot', label: 'Robot', emoji: '🤖', category: 'technology', accent: '#55D9FF' },
  { id: 'tc-satellite', label: 'Satellite', emoji: '🛰️', category: 'technology', accent: '#527BFF' },
  { id: 'tc-rocket', label: 'Rocket', emoji: '🚀', category: 'technology', accent: '#FF5D78' },
  { id: 'tc-microchip', label: 'Microchip', emoji: '🔋', category: 'technology', accent: '#37D99A' },
  { id: 'tc-headphones', label: 'Studio Headphones', emoji: '🎧', category: 'technology', accent: '#A78BFA' },

  // Category 7: Sports
  { id: 'sp-football', label: 'Football', emoji: '⚽', category: 'sports', accent: '#E2E8F0' },
  { id: 'sp-basketball', label: 'Basketball', emoji: '🏀', category: 'sports', accent: '#FB923C' },
  { id: 'sp-tennis', label: 'Tennis Ball', emoji: '🎾', category: 'sports', accent: '#A3E635' },
  { id: 'sp-cricket', label: 'Cricket Bat', emoji: '🏏', category: 'sports', accent: '#FBBF24' },
  { id: 'sp-trophy', label: 'Trophy', emoji: '🏆', category: 'sports', accent: '#FACC15' },
  { id: 'sp-medal', label: 'Medal', emoji: '🏅', category: 'sports', accent: '#F59E0B' },
  { id: 'sp-bicycle', label: 'Racing Bike', emoji: '🚲', category: 'sports', accent: '#38BDF8' },
  { id: 'sp-skateboard', label: 'Skateboard', emoji: '🛹', category: 'sports', accent: '#FF5D78' },

  // Category 8: Fun and Lifestyle
  { id: 'lf-music', label: 'Music Note', emoji: '🎵', category: 'lifestyle', accent: '#9B7BFF' },
  { id: 'lf-gift', label: 'Gift Box', emoji: '🎁', category: 'lifestyle', accent: '#FF5D78' },
  { id: 'lf-balloon', label: 'Balloon', emoji: '🎈', category: 'lifestyle', accent: '#F43F5E' },
  { id: 'lf-dice', label: 'Dice', emoji: '🎲', category: 'lifestyle', accent: '#E2E8F0' },
  { id: 'lf-puzzle', label: 'Puzzle', emoji: '🧩', category: 'lifestyle', accent: '#37D99A' },
  { id: 'lf-palette', label: 'Paint Palette', emoji: '🎨', category: 'lifestyle', accent: '#F472B6' },
  { id: 'lf-guitar', label: 'Guitar', emoji: '🎸', category: 'lifestyle', accent: '#FB923C' },
  { id: 'lf-film', label: 'Film Camera', emoji: '🎥', category: 'lifestyle', accent: '#527BFF' },
  { id: 'lf-crown', label: 'Crown', emoji: '👑', category: 'lifestyle', accent: '#FACC15' },
  { id: 'lf-wand', label: 'Magic Wand', emoji: '🪄', category: 'lifestyle', accent: '#55D9FF' },
];

export function shuffleArray<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Picks `count` visually unique symbols (never duplicating emoji or id in the same set).
 * When `category` is 'all', ensures diverse category representation across games.
 * If a specific category has fewer unique icons than `count` (e.g. 6x6 Hard = 18 pairs),
 * fills remaining slots from other categories without repeating any emoji.
 */
export function pickRandomSymbols(
  count: number,
  category: IconCategoryFilter = 'all'
): MemorySymbol[] {
  const seenEmoji = new Set<string>();
  const selected: MemorySymbol[] = [];

  if (category === 'all') {
    // Pick across shuffled categories in round-robin so every game feels rich and varied
    const categories: IconCategoryKey[] = shuffleArray([
      'everyday',
      'food',
      'nature',
      'animals',
      'travel',
      'technology',
      'sports',
      'lifestyle',
    ]);
    const buckets = categories.map((cat) =>
      shuffleArray(ICON_LIBRARY.filter((item) => item.category === cat))
    );

    let added = true;
    while (selected.length < count && added) {
      added = false;
      for (const bucket of buckets) {
        if (selected.length >= count) break;
        while (bucket.length > 0) {
          const candidate = bucket.pop()!;
          if (!seenEmoji.has(candidate.emoji)) {
            seenEmoji.add(candidate.emoji);
            selected.push(candidate);
            added = true;
            break;
          }
        }
      }
    }
    return shuffleArray(selected);
  }

  // Specific category first
  const primaryPool = shuffleArray(
    ICON_LIBRARY.filter((item) => item.category === category)
  );
  for (const item of primaryPool) {
    if (selected.length >= count) break;
    if (!seenEmoji.has(item.emoji)) {
      seenEmoji.add(item.emoji);
      selected.push(item);
    }
  }

  // If more symbols are required (e.g. 18 pairs for Hard 6x6), supplement cleanly
  if (selected.length < count) {
    const fallbackPool = shuffleArray(
      ICON_LIBRARY.filter((item) => item.category !== category)
    );
    for (const item of fallbackPool) {
      if (selected.length >= count) break;
      if (!seenEmoji.has(item.emoji)) {
        seenEmoji.add(item.emoji);
        selected.push(item);
      }
    }
  }

  return shuffleArray(selected);
}
