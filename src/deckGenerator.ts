// src/deckGenerator.ts
type Card = {
  id: string;
  type: string;
  level: number;
  color: string;
};

/**
 * Generates an enemy deck biased toward a specific type.
 * @param allCards - Pool of all available cards.
 * @param enemyType - Enemy's elemental type (e.g., "fire", "ice").
 * @param deckSize - Total number of cards to draw.
 * @param typeBias - Fraction of cards that should match the enemy type.
 */
export function generateEnemyDeck(
  allCards: Card[],
  enemyType: string,
  deckSize = 30,
  typeBias = 0.5
): Card[] {
  const sameType = allCards.filter(c => c.type === enemyType);
  const otherTypes = allCards.filter(c => c.type !== enemyType);

  const numSame = Math.min(Math.floor(deckSize * typeBias), sameType.length);
  const numOther = Math.min(deckSize - numSame, otherTypes.length);

  const chosenSame = sampleWithoutReplacement(sameType, numSame);
  const chosenOther = sampleWithoutReplacement(otherTypes, numOther);

  return shuffle([...chosenSame, ...chosenOther]);
}

/**
 * Randomly selects cards from a list (no replacement).
 */
function sampleWithoutReplacement<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

/**
 * Shuffles an array using Fisher–Yates algorithm.
 */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Rolls a 25 % chance to drop a random card from the deck.
 * Returns [boolean, Card | null].
 */
export function rollCardDrop(
  deck: Card[],
  dropRate = 0.25
): [boolean, Card | null] {
  const roll = Math.random();
  if (roll <= dropRate && deck.length > 0) {
    const card = deck[Math.floor(Math.random() * deck.length)];
    return [true, card];
  }
  return [false, null];
}

// --- Example usage for Sprint 1 demo ---
if (require.main === module) {
  const demoPool: Card[] = [];
  const types = ["fire", "ice", "earth", "water", "air"] as const;

  // Build a pool of 20 cards for each type
  for (const t of types) {
    for (let i = 0; i < 20; i++) {
      demoPool.push({
        id: `${t[0].toUpperCase()}${i}`,
        type: t,
        level: (i % 13) + 1,
        color:
          t === "fire"
            ? "red"
            : t === "ice"
            ? "blue"
            : t === "earth"
            ? "green"
            : t === "water"
            ? "cyan"
            : "gray",
      });
    }
  }

  // pick a random enemy type instead of hard-coding "fire"
  const enemy = types[Math.floor(Math.random() * types.length)];
  const deck = generateEnemyDeck(demoPool, enemy);

  console.log(`Enemy type: ${enemy}`);
  console.log("Deck size:", deck.length);

  // count how many of each type appear in the deck
  const counts = deck.reduce<Record<string, number>>((acc, c) => {
    acc[c.type] = (acc[c.type] ?? 0) + 1;
    return acc;
  }, {});
  console.log("Type counts:", counts);

  // simulate drop
  const [drop, card] = rollCardDrop(deck);
  console.log("Dropped?", drop, "Card:", card);
}
