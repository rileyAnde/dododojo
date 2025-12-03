// src/deckGenerator.ts


/*
Functions:
- generateEnemyDeck --> builds an enemy deck biased toward a specific element using the full card pool
- shuffle --> randomly shuffles a list of cards in-place
- sampleWithoutReplacement --> samples cards from a list without replacement
- rollCardDrop --> rolls for post-battle card drops from a given deck

Inputs:
- allCards: Card[] --> master pool of all available cards
- enemyType: string --> element the enemy specializes in (e.g., "fire", "water")
- deckSize: number --> desired size of the generated deck
- typeBias: number --> fraction of the deck that should match the enemyType
- deck (for rollCardDrop): Card[] --> pool of candidate cards for drops
- dropRate: number --> probability that a drop occurs in a given roll

Outputs:
- generateEnemyDeck --> returns a Card[] deck biased toward the enemyType
- shuffle --> returns a shuffled copy of the input array
- sampleWithoutReplacement --> returns a Card[] subset with no duplicates pulled
- rollCardDrop --> returns [didDrop: boolean, droppedCard: Card | null]

Outside sources:
- ChatGPT
- GitHub Copilot
- Stack Overflow 
-Google

Authors:
- Jacob Richards

Creation Date:
- 11/2025
*/


import { Card } from "./battle";

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
  dropRate = 1.0
): [boolean, Card | null] {
  const roll = Math.random();
  if (roll <= dropRate && deck.length > 0) {
    const card = deck[Math.floor(Math.random() * deck.length)];
    return [true, card];
  }
  return [false, null];
}

