/*
Functions:
- CardDisplay --> Renders a card with dynamic sizing, ripple effects, blocking overlay, and fallback image logic
- drawCardsToHand --> Draws a specified number of cards from a deck
- getCardIcon / getCardColor --> Returns appropriate icon or gradient styling based on element type
- getBackgroundImage --> Selects dojo background image based on element
- handleCardSelect --> Executes a full round sequence: remove selected card, draw replacements, enemy turn, determine winner, apply effects, and check for victory
- handleNextRound --> Resets state for the next round
- groupCardsByType --> Groups won cards by their elemental type
- renderStacks --> Renders stacked piles of won cards
- renderfx --> Displays active card effects for the current turn

Inputs:
- onReturnHome: optional callback to exit the battle
- playerName: optional string for player’s displayed name
- gymName: (unused) optional gym identifier
- element: optional player element
- gymElement: optional gym-based override element
- onVictory: callback fired on battle victory, passed the winning element

Outputs:
- Full rendering of the battle UI, including hands, selected cards, effects, animations, victory screen, and advantage chart

Outside sources:
- chatGPT, GitHub Copilot

Authors:
- Riley Anderson, Colin Treanor, Jacob Richards

Creation Date:
- 10/22/2025
*/

import React, { useState, useEffect, useRef } from 'react';
import { Swords, Trophy, Flame, Droplet, Snowflake } from 'lucide-react';
import { Battle, Card } from '../game/battle';
import { createEnemyDeck, createPlayerDeck, FALLBACK_ENEMY_DECK, FALLBACK_PLAYER_DECK, loadCardsFromXML } from '../utils/cardLoader';
import Character from './character';
import { rollCardDrop } from '../game/deckGenerator';
import TutorialOverlay from "./tutorial";
import { useTutorial } from "./usetutorial";
import { User } from '../App';

interface BattleScreenProps {
  onReturnHome?: () => void;
  cur_user?: User;
  gymName?: string;
  element?: string;
  gymElement?: string;
  onVictory?: (element: string) => void;
  isTutorial?: boolean;
  onCardDrop?: (card: Card) => void;
}

const CardJitsuBattle: React.FC<BattleScreenProps> = ({
  onReturnHome,
  cur_user: propCur_user,
  element: propElement,
  gymElement: propGymElement,
  onVictory,
  isTutorial,
  onCardDrop,
}) => {
  // Use gymElement first if provided, otherwise fall back to element, then fire
  const effectiveElement = propGymElement || propElement || 'fire';

  // Mock player data
  const [cur_user] = useState<User|undefined>(propCur_user);
  const [enemyName] = useState('Sensei');

  // Game state
  const [battle] = useState(() => new Battle(cur_user?.username || 'Player1', enemyName));
  const [gamePhase, setGamePhase] = useState<'loading' | 'selection' | 'reveal' | 'result'>('loading');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [enemyCard, setEnemyCard] = useState<Card | null>(null);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [gameWinner, setGameWinner] = useState<number>(0);

  // card data
  const [playerFullDeck, setPlayerFullDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [enemyFullDeck, setEnemyDeck] = useState<Card[]>([]);
  const [enemyHand, setEnemyHand] = useState<Card[]>([]);
  const [showAdvantage, setShowAdvantage] = useState(false);
  const [droppedCard, setDroppedCard] = useState<Card | null>(null);

  // draw cards from deck to hand
  const drawCardsToHand = (deck: Card[], amount: number) => {
    const newCards = deck.slice(0, amount);
    const remainingDeck = deck.slice(amount);
    return [newCards, remainingDeck] as const;
  };

  //tut setup
  const handRef = useRef(null);
  const advantageRef = useRef(null);
  
    const battlesteps = [
      { text: "Welcome to your first battle!", targetRef: null },
      { text: "You can see the cards in your hand here.", targetRef: handRef },
      { text: "Your goal is to get 5 cards of DIFFERENT types, or 5 cards of the SAME type, all in different colors.", targetRef: null },
      { text: "You can always use this button to check which elements beat which, but pay attention to which elements are blocked or swapped!", targetRef: advantageRef },
      { text: "Now beat that dodo! If you do, it will drop a card of it's type for you to use in later battles. Check your inventory frequently! Good luck!", targetRef: null }
    ];
    const { active, step, next, skip } = useTutorial(battlesteps);


  // Load cards from XML
  useEffect(() => {
    async function loadCards() {
      try {
        // loads all the cards in cards.xml 
        const cards = await loadCardsFromXML();
        const fullPlayerDeck = cur_user?.primaryDeck ? createPlayerDeck(cur_user?.primaryDeck) : createPlayerDeck(cards); // create player deck from user's primary deck or full card list
        const [initialHand, remainingDeck] = drawCardsToHand(fullPlayerDeck, 5);

        //make enemy hand / deck for bot
        const enemyElement = propGymElement || propElement || 'fire';
        const EnemyDeck = createEnemyDeck(cards, enemyElement, 30);
        const [initEnemyHand, remEnemyDeck] = drawCardsToHand(EnemyDeck, 5);

        setPlayerFullDeck(remainingDeck);
        setPlayerHand(initialHand);
        setEnemyDeck(remEnemyDeck);
        setEnemyHand(initEnemyHand);
        setGamePhase('selection');
      } catch (error) {
        console.error('Error loading cards:', error);
        setPlayerFullDeck([]);
        setPlayerHand(FALLBACK_PLAYER_DECK);
        setEnemyDeck(FALLBACK_ENEMY_DECK);
        setGamePhase('selection');
      }
    }
    loadCards();
  }, []);

  // Helpers
  const getCardIcon = (type: string) => {
    switch (type) {
      case 'fire': return <Flame className="w-8 h-8" />;
      case 'water': return <Droplet className="w-8 h-8" />;
      case 'ice': return <Snowflake className="w-8 h-8" />;
      case 'air': return <span className="text-2xl">💨</span>;
      case 'earth': return <span className="text-2xl">🌍</span>;
      default: return <Swords className="w-8 h-8" />;
    }
  };

  const getCardColor = (type: string) => {
    switch (type) {
      case 'fire': return 'from-red-500 to-orange-500';
      case 'water': return 'from-blue-500 to-cyan-500';
      case 'ice': return 'from-cyan-300 to-blue-300';
      case 'air': return 'from-gray-300 to-slate-400';
      case 'earth': return 'from-green-600 to-emerald-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  // get element specific background
const getBackgroundImage = () => {
  switch (effectiveElement) {
    case 'fire': return '/FireDojo.png';
    case 'water': return '/WaterDojo.png';
    case 'ice': return '/IceDojo.png';
    case 'air': return '/AirDojo.png';
    case 'earth': return '/EarthDojo.png';
    default: return '/dojo.png';
  }
};
  const toggleAdvantageTable = () => {
    setShowAdvantage(!showAdvantage);
  };
  const dojoGradients = {
    fire: "from-red-900 via-orange-600 to-yellow-500",
    water: "from-blue-900 via-cyan-700 to-sky-500",
    earth: "from-green-500 via-yellow-500 to-brown-500",
    air: "from-gray-930 via-blue-200 to-gray-500",
    ice: "from-blue-500 via-blue-300 to-blue-500"
  };

  useEffect(() => {
    const url = getBackgroundImage();
    console.log('Setting background to:', url);
    // Set background image for entire page
    document.body.style.backgroundImage = `url(${getBackgroundImage()}), url(${getBackgroundImage()})`;
    document.body.style.backgroundSize = '100% auto, 100% 100%';
    document.body.style.backgroundRepeat = 'no-repeat, no-repeat';
    document.body.style.backgroundPosition = 'center center, 0 0';
    document.body.style.backgroundAttachment = 'fixed, fixed'; // optional, makes it stay still
    document.body.style.backdropFilter = 'blur(0px), blur(5px)';

    // Cleanup to prevent old background persisting
    return () => {
      document.body.style.backgroundImage = '';
    };
  }, [effectiveElement]);

  // reusable card display component
  const CardDisplay: React.FC<{ card: Card; size?: 'small' | 'xsmall' | 'large'; blocked?: boolean }> = ({ card, size = 'large', blocked = false }) => {
    const [imageError, setImageError] = useState(false);
    const imagePath = `/cards/${card.id}.png`;
    // if large, set to biggest size, if small, set to small, if xsmall, set to smallest
    const sizeClasses = size === 'large' ? 'w-48 h-64' : size === 'small' ? 'w-24 h-32' : 'w-18 h-24';

    // ripple effect on power cards
    React.useEffect(() => {
      if (!document.getElementById('card-ripple-styles')) {
        const s = document.createElement('style');
        s.id = 'card-ripple-styles';
        s.innerHTML = `
          @keyframes rippleUp {
            0% { transform: translateY(60%); opacity: 0; }
            20% { opacity: 0.7; }
            60% { opacity: 0.85; }
            100% { transform: translateY(-60%); opacity: 0; }
          }
        `;
        document.head.appendChild(s);
      }
    }, []);

    const XOverlay = blocked ? (() => {
      return (
        <div className="flex justify-center" style={{position: 'absolute', width: '100%', height: '100%', border: '0.5rem solid red'}}>
          <div className="flex" style={{position: 'absolute', top: '47.25%', backgroundColor: 'red', height: '0.5rem', color: 'red', width: '171%', transform: 'rotate(56.46deg)'}}></div>
        </div>
      );
    })() : null;

    const ripple = card.fx ? (() => {
      const colorMap: Record<string, string> = {
        fire: '255,99,71',
        water: '59,130,246',
        ice: '125,211,252',
        air: '137,142,255',
        earth: '34,197,94',
        default: '250,204,21'
      };
      const rgb = colorMap[card.type] || colorMap.default;
      const isSelected = selectedCard?.id === card.id;
      const duration = isSelected ? '0.9s' : '1.6s';

      return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '6%',
              left: '-5%',
              zIndex: 0,
              width: '110%',
              height: '72%',
              borderRadius: '1.1rem',
              background: `linear-gradient(180deg, rgba(${rgb},0.95), rgba(${rgb},0.35))`,
              mixBlendMode: 'screen',
              transform: 'translateZ(0)',
              filter: 'blur(20px)',
              animation: `rippleUp ${duration} ease-in-out infinite`
            }}
          />
        </div>
      );
    })() : null;

    const ringClass = '';

    if (imageError) {
      return (
        <div className={`relative ${sizeClasses} ${ringClass} bg-gradient-to-br ${getCardColor(card.type)} rounded-2xl p-4 shadow-2xl border-4 border-white`}>
          {ripple}
          <div className="flex justify-between items-start mb-2">
            <span className="text-white font-bold text-3xl">{card.rank}</span>
            <div className="text-white">{getCardIcon(card.type)}</div>
          </div>
        </div>
      );
    }

    return (
      <div title={card.fx || ''} className={`relative ${sizeClasses} ${ringClass}`}>
        {ripple}
        {XOverlay}
        <img
          src={imagePath}
          alt={`${card.type} card rank ${card.rank}`}
          style={{ zIndex: 10 }}
          className={`rounded-2xl shadow-2xl object-cover w-full h-full`}
          onError={() => setImageError(true)}
        />
      </div>
    );
  };

 // gameplay logic
  const handleCardSelect = (card: Card) => {
    if (gamePhase !== 'selection') {
      return;
    }

    // remove the selected card from hand
    const newHand = playerHand.filter((c) => c.id !== card.id);

    // ---- PLAYER DRAW LOGIC ----
    let nextPlayerDeck = playerFullDeck;
    let nextPlayerHand = newHand;

    if (playerFullDeck.length > 0) {
      const [drawnCards, remainingDeck] = drawCardsToHand(playerFullDeck, 1);
      nextPlayerDeck = remainingDeck;
      nextPlayerHand = [...newHand, ...drawnCards];
    }

    setPlayerFullDeck(nextPlayerDeck);
    setPlayerHand(nextPlayerHand);
    setSelectedCard(card);

    // ---- ENEMY TURN + DRAW ----
    const randomEnemy = battle.agent_turn(enemyHand);
    const enemyBaseNewHand = enemyHand.filter(
      (c) => c.id !== randomEnemy.id
    );

    let nextEnemyDeck = enemyFullDeck;
    let nextEnemyHand = enemyBaseNewHand;

    if (enemyFullDeck.length > 0) {
      const [EdrawnCards, EremainingDeck] = drawCardsToHand(enemyFullDeck, 1);
      nextEnemyDeck = EremainingDeck;
      nextEnemyHand = [...enemyBaseNewHand, ...EdrawnCards];
    }

    setEnemyDeck(nextEnemyDeck);
    setEnemyHand(nextEnemyHand);

    // who will be totally out of cards after this round?
    const noPlayerCardsRemaining =
      nextPlayerHand.length === 0 && nextPlayerDeck.length === 0;
    const noEnemyCardsRemaining =
      nextEnemyHand.length === 0 && nextEnemyDeck.length === 0;

    setEnemyCard(randomEnemy);
    setGamePhase('reveal');

    setTimeout(() => {
      const winner = battle.turn(card, randomEnemy);

      if (winner?.id === card.id) {
        setRoundWinner(cur_user?.username || 'Player1');
      } else if (winner?.id === randomEnemy.id) {
        setRoundWinner(enemyName);
      } else {
        setRoundWinner('Tie');
      }

      const result = battle.checkwin();
      let finalResult = result;

      // if no one has "won" by tokens, but someone has no cards left,
      // force a winner so the battle can't soft-lock.
      if (result === 0 && (noPlayerCardsRemaining || noEnemyCardsRemaining)) {
        if (noPlayerCardsRemaining && !noEnemyCardsRemaining) {
          // player has no cards, enemy still does
          finalResult = 2;
        } else if (!noPlayerCardsRemaining && noEnemyCardsRemaining) {
          // enemy has no cards, player still does
          finalResult = 1;
        } else {
          // BOTH out of cards: break tie using who has more won cards
          const stateNow = battle.getState();
          const playerTokens = stateNow.player_won.flat().length;
          const enemyTokens = stateNow.enemy_won.flat().length;

          if (playerTokens > enemyTokens) {
            finalResult = 1;
          } else if (enemyTokens > playerTokens) {
            finalResult = 2;
          } else {
            // perfect tie: give it to the enemy so game always ends
            finalResult = 2;
          }
        }
      }

      setGameWinner(finalResult);

      // CARD DROP LOGIC – ONLY for non-gym battles (random encounters)
      if (finalResult === 1 && !propGymElement) {
        const dropElement = effectiveElement; // this is propElement for encounters

        // Only use enemy cards of that element for drops
        const enemyPool = [...nextEnemyDeck, ...nextEnemyHand].filter(
          (c) => c.type === dropElement
        );

        const [didDrop, cardDrop] = rollCardDrop(enemyPool /*, 0.25 */);

        if (didDrop && cardDrop) {
          setDroppedCard(cardDrop);
          if (onCardDrop) {
            onCardDrop(cardDrop);
          }
        }
      }

      // Victory callback (works for gyms + encounters)
      if (finalResult === 1 && onVictory) {
        const elementForParent = propGymElement || effectiveElement;
        onVictory(elementForParent);
      }

      setGamePhase('result');
    }, 1500);
  };

  const handleNextRound = () => {
    setSelectedCard(null);
    setEnemyCard(null);
    setRoundWinner(null);
    setGamePhase('selection');
  };

  const state = battle.getState();

  //group won cards by type
  const groupCardsByType = (cards: Card[][]): Record<string, Card[]> => {
    const grouped: Record<string, Card[]> = {};
    cards.flat().forEach((card) => {
      if (!grouped[card.type]) grouped[card.type] = [];
      grouped[card.type].push(card);
    });
    return grouped;
  };

  const playerWonStacks = groupCardsByType(state.player_won);
  const enemyWonStacks = groupCardsByType(state.enemy_won);

  if (gamePhase === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading cards...</p>
        </div>
      </div>
    );
  }

if (gameWinner !== 0) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-12 text-center border border-white border-opacity-20">
        <Trophy className="w-32 h-32 text-yellow-400 mx-auto mb-6" />
        <h1 className="text-5xl font-bold text-white mb-4">
          {gameWinner === 1 ? 'Victory!' : 'Defeat!'}
        </h1>
        <p className="text-2xl text-cyan-300 mb-8">
          {gameWinner === 1 ? `${cur_user?.username || 'Player1'} wins the battle!` : `${enemyName} wins the battle!`}
        </p>

        {/*Show dropped card on victory (random encounters) */}
        {gameWinner === 1 && droppedCard && (
          <div className="mb-8">
            <p className="text-xl text-yellow-300 mb-4">You found a new card!</p>
            <div className="flex justify-center">
              <CardDisplay card={droppedCard} />
            </div>
          </div>
        )}

        <button
          onClick={onReturnHome || (() => window.location.reload())}
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold text-xl hover:scale-105 transition"
        >
          Return to Map
        </button>
      </div>
    </div>
  );
}

  // rendering stacks
  const renderStacks = (stacks: Record<string, Card[]>) => {
    const types = Object.keys(stacks);
    if (types.length === 0) return null;

    return (
      <div className="flex gap-2">
        {types.map((type) => (
          <div key={type} className="flex flex-col items-center">
            <div className="flex flex-col items-center">
              {stacks[type].map((card, i) => (
                <div
                  key={card.id}
                  className={i > 0 ? '-mt-20' : ''}
                  style={{ zIndex: 10 + stacks[type].length + i }}
                >
                  <CardDisplay card={card} size="xsmall" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderfx = () => {
    const fxElements = [];
    const effects = { ...battle.previous_results };
    if (gamePhase === 'selection' || gamePhase === 'reveal') {
      // we should use the results labeled "next" instead during selection phase
      effects.typeChange = effects.typeChangeNext;
      effects.blockedTypesActive = effects.blockedTypesNext;
      effects.ruleLowerWins = effects.ruleLowerWinsNext;
      effects.modifyPlayer = effects.modifyNext.player;
      effects.modifyEnemy = effects.modifyNext.enemy;
    }

    if (effects.typeChange.size !== 0) {
      fxElements.push(
        <div key="typeChange" className="flex items-center gap-2 mb-2">
          {[...effects.typeChange.entries()].map(([original, changed]) => (
            <div key={original} className="flex flex-row items-center text-white justify-center text-xlg font-bold" alt-text={`Type changed from ${original} to ${changed} for this round`}>
              <img src={'/elementsymbols/' + original + '.png'} height='33%' width='33%' />
              ➔
              <img src={'/elementsymbols/' + changed + '.png'} height='33%' width='33%' />
            </div>
          ))}
        </div>
      );
    }
    if (effects.discardOpponentColor) {
      fxElements.push(
        <div key="discardOpponentColor" className="flex items-center gap-2 mb-2">
          <span className="text-white font-bold">Opponent Discarded:</span>
          <span className="text-white">{effects.discardOpponentColor}</span>
        </div>
      );
    }

    if (effects.discardPlayerColor) {
      fxElements.push(
        <div key="discardPlayerColor" className="flex items-center gap-2 mb-2">
          <span className="text-white font-bold">You Discarded:</span>
          <span className="text-white">{effects.discardPlayerColor}</span>
        </div>
      );
    }

    if (effects.modifyPlayer > 0) {
      fxElements.push(
        <div key="modifyPlayer" className="flex items-center justify-start gap-2 mb-2">
          <img src='/playerplus2.png' width='33%' height="33%" alt="Your card's rank is increased by 2 for this turn!" />
        </div>
      );
    }

    if (effects.modifyPlayer < 0) {
      fxElements.push(
        <div key="modifyPlayer" className="flex items-center justify-start gap-2 mb-2">
          <img src='/playerneg2.png' width='33%' height="33%" alt="Your card's rank is decreased by 2 for this turn!" />
        </div>
      );
    }

    if (effects.modifyEnemy > 0) {
      fxElements.push(
        <div key="modifyEnemy" className="flex items-center justify-end gap-2 mb-2">
          <img src='/enemyplus2.png' width='33%' height="33%" alt="Your opponent's card's rank is increased by 2 for this turn!" />
        </div>
      );
    }

    if (effects.modifyEnemy < 0) {
      fxElements.push(
        <div key="modifyEnemy" className="flex items-center justify-end gap-2 mb-2">
          <img src='/enemyneg2.png' width='33%' height="33%" alt="Your opponent's card's rank is decreased by 2 for this turn!" />
        </div>
      );
    }

    if (effects.ruleLowerWins) {
      fxElements.push(
        <div key="ruleLowerWins" className="flex items-center justify-center gap-2 mb-2">
          <img src='/lw.png' width='33%' height="33%" alt="Golf rules! The lower card wins this round" />
        </div>
      );
    }

    if (effects.blockedTypesActive.size > 0) {
      fxElements.push(
        <div key="blockedTypes" className="flex items-center justify-center gap-2 mb-2">
          {[...effects.blockedTypesActive].map((type) => (
            <div key={type} className="flex flex-row items-center text-white justify-center text-xlg font-bold" alt-text={`Type ${type} is blocked for this round`}>
              <img src={'/elementsymbols/' + type + '.png'} height='33%' width='33%' />
              <span className="ml-1">is Blocked</span>
            </div>
          ))}
        </div>
      );
    }

    return fxElements
  }

  return (
    <div className="min-h-screen p-6 bg-transparent">
      {isTutorial && <TutorialOverlay
                    visible={active}
                    text={step.text}
                    targetRef={step.targetRef}
                    onNext={next}
                    onSkip={skip}
                  />}
      {/* display dodo sprites */}
          <div className='z-20 flex fixed w-[calc(100%-3rem)] h-auto flex-row justify-center pt-60 pointer-events-none'>
            <div className="flex flex-row w-[calc(75%)] h-auto justify-between">
              <div className='flex'>
                <Character
                  type='jay'
                  flipped='y'
                  size='large'
                />
          </div>
          <div className='flex'>
              <Character
                type={effectiveElement}
                flipped='n'
                size='large'
            />
          </div>
            </div>
          </div>
      {/* header */}
      <div className="max-w-8xl mx-auto mb-6 z-10">
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-4 border border-white border-opacity-20">
          <div className="flex justify-between items-start">
            {/* Player Info + Won Stacks */}
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {cur_user?.username[0] || 'P'}
                </div>
                <div>
                  <div className="text-white font-bold">{cur_user?.username || 'Player1'}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Swords className="text-yellow-400" size={32} />
              <span className="text-white text-2xl font-bold">VS</span>
            </div>

            {/* Enemy Info + Won Stacks */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-white font-bold text-right">
                    {enemyName}
                  </div>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  {enemyName[0]}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-24 left-2 z-100">
            <div className="relative">
              {renderStacks(playerWonStacks)}
            </div>
          </div>

          <div className="absolute top-24 right-2 z-100">
            <div className="relative">
              {renderStacks(enemyWonStacks)}
            </div>
          </div>
        </div>
      </div>

      {/* battle Arena */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="grid grid-cols-3 column-gap-0">
          <div className="flex flex-col items-center">
            {/* <h3 className="text-cyan-400 font-bold text-xl mb-4">Your Card</h3> */}
            {selectedCard ? (
              <div className='z-10'><CardDisplay card={selectedCard} /> </div>
            ) : (
              <div>
              </div>
            )}
            <div className="fixed w-48 h-64 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl border-2 border-dashed border-white border-opacity-30 flex items-center justify-center">
              <span className="text-white text-opacity-50">Select your card</span>
            </div>
          </div>
          {/* placeholder for active effect icons */}
          <div className="flex flex-col items-center">
            {renderfx()}
          </div>

          <div className="flex flex-col items-center">
            {/* <h3 className="text-red-400 font-bold text-xl mb-4">Opponent's Card</h3> */}
            {gamePhase === 'reveal' || gamePhase === 'result' ? (
              <div className='z-10'> <CardDisplay card={enemyCard != null ? enemyCard : FALLBACK_ENEMY_DECK[0]} /> </div>
            ) : (
              <div></div>
            )}
            <div className="z-0 fixed w-48 h-64 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl border-2 border-dashed border-white border-opacity-30 flex items-center justify-center">
              <span className="text-white text-opacity-50">Opponent's card</span>
            </div>
          </div>
        </div>

        {gamePhase === 'result' && roundWinner && (
          <div className="text-center mt-8">
            <div className="inline-block bg-yellow-400 text-black px-8 py-4 rounded-full text-2xl font-bold shadow-2xl">
              {roundWinner === 'Tie' ? 'Draw!' : `${roundWinner} wins this round!`}
            </div>
            <button
              onClick={handleNextRound}
              className="block mx-auto mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold hover:scale-105 transition"
            >
              Next Round
            </button>
          </div>
        )}
      </div>

      {/* player Hand */}
      {gamePhase === 'selection' && (
        <div ref={handRef} className="flex flex-col max-w-3xl mx-auto fixed-bottom-center z-100 mb-4 bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-4 border border-white border-opacity-20">
          {/* <h3 className="text-white font-bold text-xl mb-4 text-center">Choose Your Card</h3> */}
          <div className="flex gap-2 justify-center flex-wrap">
            {playerHand.map((card: Card) => (
              <button
                key={card.id}
                onClick={() => handleCardSelect(card)}
                className="hover:scale-110 hover:-translate-y-2 transition duration-200"
              >
                <CardDisplay card={card} size="small" blocked={battle.previous_results.blockedTypesNext.has(card.type)} />
              </button>
            ))}
          </div>
        </div>
      )} {/* Advantage Table Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          ref={advantageRef}
          onClick={toggleAdvantageTable}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition"
        >
          Element Advantage Chart
        </button>
      </div>
      {/* pop up display */}
      {showAdvantage && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[500] bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80 backdrop-blur-sm"
          onClick={toggleAdvantageTable} // closes popup when clicking outside
        >
          <div
            className={`relative p-6 rounded-3xl shadow-2xl border border-black/20 bg-gradient-to-br ${dojoGradients[propGymElement as keyof typeof dojoGradients] || 'from-slate-800 to-slate-900'
              }`}
            onClick={(e) => e.stopPropagation()} // prevents close when clicking on image
          >
            <img
              src="/advantage.png"
              alt="Element Advantage Table"
              className="w-[600px] max-w-full rounded-2xl shadow-lg border-2 border-white/30"
            />
            <button
              onClick={toggleAdvantageTable}
              className="absolute top-3 right-3 text-white text-2xl font-bold hover:text-red-400 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );

};

export default CardJitsuBattle;
