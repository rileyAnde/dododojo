import { Card } from '../game/battle';
import { generateEnemyDeck as generateEnemyDeckFromPool } from '../game/deckGenerator';
import { sampleWithoutReplacement } from '../game/deckGenerator';

export async function loadCardsFromXML(): Promise<Card[]> {
  // this is where we will make a call to the backend to get all of the users cards 
  // might not work unless the users cards.xml is in the public folder
  const response = await fetch('/cards.xml');
  const xmlText = await response.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  const cardElements = xmlDoc.getElementsByTagName('card');
  const cards: Card[] = [];
  
  for (let i = 0; i < cardElements.length; i++) {
    const cardEl = cardElements[i];
    const id = parseInt(cardEl.getAttribute('id') || '0');
    const type = cardEl.getElementsByTagName('type')[0]?.textContent || 'fire';
    const rank = parseInt(cardEl.getElementsByTagName('level')[0]?.textContent || '1');
    const color = cardEl.getElementsByTagName('color')[0]?.textContent || 'red';
    const fx = cardEl.getElementsByTagName('fx')[0]?.textContent || '';
    cards.push({ id, type, rank, color, fx });
  }
  
  return cards;
}

//creates a shuffled 30-card deck for the player, will be changed to grabbing active deck
export function createPlayerDeck(cards: Card[]): Card[] {
  return sampleWithoutReplacement(cards, 30);
}

// creates enemy deck
export function createEnemyDeck(cards: Card[], enemyType?: string, size = 5): Card[] {
  // If an enemyType is provided, prefer a biased deck using generateEnemyDeckFromPool
  if (enemyType) {
    try {
      const deck = generateEnemyDeckFromPool(cards, enemyType, size, 0.6);
      return deck.slice(0, size);
    } catch (e) {
      // fall through to random selection
    }
  }
  //return `size` random cards from the pool
  return sampleWithoutReplacement(cards, size);
}

// in case loading the deck doesn't work it will fallback to this 
export const FALLBACK_PLAYER_DECK: Card[] = [
  { id: 1, type: 'fire', rank: 5, color: 'red', fx: '' },
  { id: 2, type: 'water', rank: 7, color: 'blue', fx: '' },
  { id: 3, type: 'ice', rank: 4, color: 'white', fx: '' },
  { id: 4, type: 'air', rank: 8, color: 'yellow', fx: '' },
  { id: 5, type: 'earth', rank: 6, color: 'green', fx: '' },
];

export const FALLBACK_ENEMY_DECK: Card[] = [
  { id: 101, type: 'fire', rank: 2, color: 'orange', fx: '' },
  { id: 102, type: 'water', rank: 3, color: 'purple', fx: '' },
  { id: 103, type: 'ice', rank: 2, color: 'black', fx: '' },
  { id: 104, type: 'air', rank: 3, color: 'yellow', fx: '' },
  { id: 105, type: 'earth', rank: 2, color: 'green', fx: '' },
];