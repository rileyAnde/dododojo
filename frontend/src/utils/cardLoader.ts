/**
Functions: 
main: helper functions to load and create card decks for users and enemies
Inputs: players cards, total card pool from XML, desired deck properties
Outputs: created or expanded card decks for players and enemies
Authors: Hannah Smith 
**/
import { backend_Card, Card } from '../game/battle';
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

//helper function to convert backend_Card[] to frontend_Card[]
export async function expand_cards(curUser_cards: backend_Card[]):Promise<Card[]>{
  const allCards: Card[] | undefined =  await loadCardsFromXML()
  let curUserExpandedCards: Card[] = []
  //if user has no cards return starter deck -- this is for new accounts only
  if (curUser_cards.length == 0) { 
    return createStarterDeck(allCards);
  }
  //otherwise expand cards normally
  curUser_cards.forEach((card)=> { 
    const FE_Card:Card =  allCards[card.id]
    for (let i=0; i<card.quantity; i++){
      curUserExpandedCards.push(FE_Card)
    }
  }) 
  return curUserExpandedCards
}


//creates a shuffled deck for the player
export function createPlayerDeck(cards: Card[]): Card[] {
  if (cards.length < 30) {
    return sampleWithoutReplacement(cards, cards.length);
  }
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

//avg rank can be changed to val we pick
export function createStarterDeck(cards: Card[], avgRank = 6, elements = ['air','fire','water','ice','earth']): Card[] {
  const COLORS = ['blue','red','green','yellow','purple','white','black'];
  const DECK_SIZE = 30;
  const targetTotal = avgRank * DECK_SIZE;
  const deck: Card[] = [];
  const baseColorCount = Math.floor(DECK_SIZE / COLORS.length);
  const remainder = DECK_SIZE % COLORS.length;
  const colorDistribution: Record<string, number> = {};
  COLORS.forEach((c,i)=>colorDistribution[c]=baseColorCount+(i<remainder?1:0));
  const score = (c: Card)=>-(Math.abs(c.rank-avgRank)+Math.random()*3);
  for (const e of elements) {
    const pool = cards.filter(c=>c.type===e);
    deck.push(...[...pool].sort((a,b)=>score(b)-score(a)).slice(0,6));
  }
  const colorCount: Record<string,number> = Object.fromEntries(COLORS.map(c=>[c,0]));
  deck.forEach(c=>colorCount[c.color]++);
  for (const color of COLORS) {
    while(colorCount[color]>colorDistribution[color]){
      const idx = deck.findIndex(c=>c.color===color);
      const bad = deck[idx];
      const needed = COLORS.find(c=>colorCount[c]<colorDistribution[c]);
      if(!needed) break;
      const rep = cards.filter(c=>c.color===needed&&c.type===bad.type&&!deck.includes(c)).sort((a,b)=>score(b)-score(a))[0];
      if(!rep) break;
      deck[idx]=rep;
      colorCount[color]--;
      colorCount[needed]++;
    }
  }
  let diff = targetTotal-deck.reduce((s,c)=>s+c.rank,0);
  while(diff!==0){
    const c = deck[Math.floor(Math.random()*deck.length)];
    if(diff>0&&c.rank<12){c.rank++;diff--;}
    else if(diff<0&&c.rank>1){c.rank--;diff++;}
  }
  return deck;
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