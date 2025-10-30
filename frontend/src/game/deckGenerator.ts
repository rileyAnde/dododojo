// src/deckGenerator.ts
import { Card } from '../../../battle';

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
export function sampleWithoutReplacement<T>(arr: T[], n: number): T[] {
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

