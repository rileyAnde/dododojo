import React, { useState, useEffect } from 'react';
import { Swords, Trophy, Flame, Droplet, Snowflake } from 'lucide-react';
import { Battle, Card } from '../game/battle';
import { createEnemyDeck, createPlayerDeck, FALLBACK_ENEMY_DECK, FALLBACK_PLAYER_DECK, loadCardsFromXML } from '../utils/cardLoader';

interface BattleScreenProps {
  onReturnHome?: () => void;
  playerName?: string;
}

const CardJitsuBattle: React.FC<BattleScreenProps> = ({ onReturnHome, playerName: propPlayerName }) => {
  // Mock player data
  const [playerName] = useState(propPlayerName || 'Player1');
  const [enemyName] = useState('Sensei');
  
  // Game state
  const [battle] = useState(() => new Battle(playerName, enemyName));
  const [gamePhase, setGamePhase] = useState<'loading' | 'selection' | 'reveal' | 'result'>('loading');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [enemyCard, setEnemyCard] = useState<Card | null>(null);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [gameWinner, setGameWinner] = useState<number>(0);

  //card data
  const [playerFullDeck, setPlayerFullDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [enemyFullDeck, setEnemyDeck] = useState<Card[]>([]);
  const [enemyHand, setEnemyHand] = useState<Card[]>([]);

  //draw cards from deck to hand
  const drawCardsToHand = (deck: Card[], amount: number) => {
    const newCards = deck.slice(0, amount);
    const remainingDeck = deck.slice(amount);
    return [newCards, remainingDeck] as const;
  };

  // Load cards from XML
  useEffect(() => {
    async function loadCards() {
      try {
        // loads all the cards in cards.xml 
        const cards = await loadCardsFromXML();
        const fullPlayerDeck = createPlayerDeck(cards); // create / pull deck
        const [initialHand, remainingDeck] = drawCardsToHand(fullPlayerDeck, 5);
        
        //make enemy hand / deck for bot
        const EnemyDeck = createEnemyDeck(cards, 'fire', 30)
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

  // reusable card display component
  const CardDisplay: React.FC<{ card: Card; size?: 'small' | 'xsmall' | 'large' }> = ({ card, size = 'large' }) => {
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
        <img
          src={imagePath}
          alt={`${card.type} card rank ${card.rank}`}
          style={{ zIndex: 10 }}
          className={`rounded-2xl shadow-2xl border-4 border-white object-cover w-full h-full`}
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
    
    //remove the selected card from hand
    const newHand = playerHand.filter(c => c.id !== card.id);
    
    //draw a new card from the deck if available TODO: shuffle at end of deck or draw game?
    if (playerFullDeck.length > 0) {
      const [drawnCards, remainingDeck] = drawCardsToHand(playerFullDeck, 1);
      setPlayerFullDeck(remainingDeck);
      setPlayerHand([...newHand, ...drawnCards]);
    } else {
      setPlayerHand(newHand);
    }

    setSelectedCard(card);
    const randomEnemy = battle.agent_turn(enemyHand);
    const EnemyNewHand = enemyHand.filter(c => c.id !== randomEnemy.id);
    if (enemyFullDeck.length > 0) {
      const [EdrawnCards, EremainingDeck] = drawCardsToHand(enemyFullDeck, 1);
      setEnemyDeck(EremainingDeck);
      setEnemyHand([...EnemyNewHand, ...EdrawnCards]);
    } else {
      setEnemyHand(EnemyNewHand);
    }

    setEnemyCard(randomEnemy);
    setGamePhase('reveal');
    setTimeout(() => {
      battle.turn(card, randomEnemy);
      const winner = battle.winner(card, randomEnemy);
      if (winner?.id === card.id) {
        setRoundWinner(playerName);
      }
      else if (winner?.id === randomEnemy.id) {
        setRoundWinner(enemyName);
      }
      else {
        setRoundWinner('Tie');
      }
      setGameWinner(battle.checkwin());
      setGamePhase('result');
    }, 2000);
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
            {gameWinner === 1 ? `${playerName} wins the battle!` : `${enemyName} wins the battle!`}
          </p>
          <button
            onClick={onReturnHome || (() => window.location.reload())}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold text-xl hover:scale-105 transition"
          >
            Return to Dojo
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
                style={{ zIndex: stacks[type].length + i }}
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800 p-6">
      {/* header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-4 border border-white border-opacity-20">
          <div className="flex justify-between items-start">
            {/* Player Info + Won Stacks */}
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {playerName[0]}
                </div>
                <div>
                  <div className="text-white font-bold">{playerName}</div>
                </div>
              </div>
              {renderStacks(playerWonStacks)}
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
              {renderStacks(enemyWonStacks)}
            </div>
          </div>
        </div>
      </div>

      {/* battle Arena */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <h3 className="text-cyan-400 font-bold text-xl mb-4">Your Card</h3>
            {selectedCard ? (
              <CardDisplay card={selectedCard} />
            ) : (
              <div className="w-48 h-64 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl border-2 border-dashed border-white border-opacity-30 flex items-center justify-center">
                <span className="text-white text-opacity-50">Select a card</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center">
            <h3 className="text-red-400 font-bold text-xl mb-4">Opponent's Card</h3>
            {gamePhase === 'reveal' || gamePhase === 'result' ? (
              enemyCard && <CardDisplay card={enemyCard} />
            ) : (
              <div className="w-48 h-64 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl shadow-2xl border-4 border-white flex items-center justify-center">
                <span className="text-white text-6xl">?</span>
              </div>
            )}
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
        <div className="max-w-6xl mx-auto">
          <h3 className="text-white font-bold text-xl mb-4 text-center">Choose Your Card</h3>
          <div className="flex gap-4 justify-center flex-wrap">
            {playerHand.map((card: Card) => (
              <button
                key={card.id}
                onClick={() => handleCardSelect(card)}
                className="hover:scale-110 hover:-translate-y-2 transition duration-200"
              >
                <CardDisplay card={card} size="small" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardJitsuBattle;
