import { Card } from '../game/battle';

export async function loadCardsFromXML(): Promise<Card[]> {
  try {
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
  } catch (error) {
    console.error('Error loading cards:', error);
    return [];
  }
}

// Get random cards for a deck (useful for testing)
export function getRandomDeck(allCards: Card[], deckSize: number = 5): Card[] {
  const shuffled = [...allCards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, deckSize);
}

// Get cards by specific criteria (useful for building balanced decks)
export function filterCards(
  allCards: Card[], 
  options: {
    types?: string[];
    minRank?: number;
    maxRank?: number;
    colors?: string[];
    hasFx?: boolean;
  }
): Card[] {
  return allCards.filter(card => {
    if (options.types && !options.types.includes(card.type)) return false;
    if (options.minRank !== undefined && card.rank < options.minRank) return false;
    if (options.maxRank !== undefined && card.rank > options.maxRank) return false;
    if (options.colors && !options.colors.includes(card.color)) return false;
    if (options.hasFx !== undefined) {
      const cardHasFx = card.fx !== '';
      if (options.hasFx !== cardHasFx) return false;
    }
    return true;
  });
}