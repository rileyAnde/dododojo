import React, { useState } from 'react';
import { Swords, Flame, Droplet, Snowflake, Filter, SortAsc } from 'lucide-react';
import { Card } from '../game/battle';
import { generateEnemyDeck } from '../game/deckGenerator';
import { loadCardsFromXML } from '../utils/cardLoader';
import { User } from '../App';
import { update_PrimaryDeck } from '../actions/userActions';

interface Inventory {
  onReturnHome?: () => void;
  cur_user?: User;
}
//temp for displaying
const cards = await loadCardsFromXML();

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

const handleDeckUpdate = async (user:User|undefined, activeDeck:Card[], onReturnHome: () => void ) => {
    try{
      if (user){
        console.log("user in handleDeckUpdate", user)
        await update_PrimaryDeck(user, activeDeck)
        onReturnHome()
        return
      }
    }catch(error){
      alert("Issue updating deck, reload and try again")
      return
    }

  }

const InventoryManager: React.FC<Inventory> = ({ onReturnHome, cur_user }) => {
  const [playerName] = useState(cur_user?.username || 'Player1');
  const initialActiveDeck: Card[] =
    (Array.isArray(cur_user?.primaryDeck) && cur_user!.primaryDeck.length > 0)
      ? cur_user!.primaryDeck
      : generateEnemyDeck(cards, 'fire', 10, 0.6);

  const initialInventory: Card[] =
    (Array.isArray(cur_user?.inventory) && cur_user!.inventory.length > 0)
      ? cur_user!.inventory
      : generateEnemyDeck(cards, 'water', 20, 0.6);
  
  const [activeDeck, setActiveDeck] = useState<Card[]>(initialActiveDeck);
  const [inventory, setInventory] = useState<Card[]>(initialInventory.filter(c => !initialActiveDeck.includes(c)));
  const [filterType, setFilterType] = useState<string>('all');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleDragStart = (card: Card, from: 'active' | 'inventory') => {
    (event as DragEvent).dataTransfer?.setData('card', JSON.stringify({ card, from }));
  };

  const handleDrop = (to: 'active' | 'inventory') => (event: React.DragEvent) => {
    event.preventDefault();
    const data = event.dataTransfer.getData('card');
    if (!data) return;
    const { card, from } = JSON.parse(data);

    if (from === to) return;
    if (to === 'active' && activeDeck.length >= 30) return; // deck cap

    // allow duplicates: don't filter by id, remove only first instance
    if (from === 'active') {
      const idx = activeDeck.findIndex((c) => c.id === card.id);
      if (idx !== -1) activeDeck.splice(idx, 1);
      setActiveDeck([...activeDeck]);
      setInventory([...inventory, card]);
    } else {
      const idx = inventory.findIndex((c) => c.id === card.id);
      if (idx !== -1) inventory.splice(idx, 1);
      setInventory([...inventory]);
      setActiveDeck([...activeDeck, card]);
    }
  };

  const CardDisplay: React.FC<{ card: Card; size?: 'small' | 'xsmall' | 'large' }> = ({ card, size = 'large' }) => {
    const [imageError, setImageError] = useState(false);
    const imagePath = `/cards/${card.id}.png`;
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
            // const isSelected = selectedCard?.id === card.id;
            const duration = '1.6s';

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

    return (
      <div
        draggable
        onDragStart={() => handleDragStart(card, activeDeck.includes(card) ? 'active' : 'inventory')}
        title={card.fx || ''}
        className={`relative ${sizeClasses}`}
      >
        {ripple}
        {imageError ? (
          <div className={`relative ${sizeClasses} bg-gradient-to-br ${getCardColor(card.type)} rounded-2xl p-4 shadow-2xl border-4 border-white`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-white font-bold text-3xl">{card.rank}</span>
              <div className="text-white">{getCardIcon(card.type)}</div>
            </div>
          </div>
        ) : (
          <img
            src={imagePath}
            alt={`${card.type} card rank ${card.rank}`}
            onError={() => setImageError(true)}
            className="rounded-2xl shadow-2xl border-2 border-white object-cover w-full h-full"
          />
        )}
      </div>
    );
  };

  const render_deck = (cards: Card[], onDropHandler: (e: React.DragEvent) => void) => (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDropHandler}
      className="flex flex-wrap gap-3 min-h-[120px] p-3 rounded-xl bg-black/20 border border-white/10"
    >
      {cards.map((card, i) => (
        <CardDisplay key={`${card.id}-${i}`} card={card} size="small" />
      ))}
    </div>
  );

  const filteredInventory = inventory
    .filter(c => (filterType === 'all' ? true : c.type === filterType))
    .sort((a, b) => sortAsc ? a.rank - b.rank : b.rank - a.rank);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800 p-6 text-white">
      {/* Header */}
      <div className="max-w-8xl mx-auto mb-6">
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 border border-white/20 flex justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white">
              {playerName[0]}
            </div>
            <div>
              <div className="font-bold">{playerName}</div>
            </div>
          </div>
          <button
            onClick={async () => {
            // Pass the function reference, not its return value
            console.log("in onClick", cur_user)
            const callback = onReturnHome || (() => window.location.reload());
            await handleDeckUpdate?.(cur_user, activeDeck, callback);
          }}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold hover:scale-105 transition"
          >
            Return to Dojo
          </button>
        </div>
      </div>

      {/* active Deck */}
      <div className="max-w-8xl mx-auto mb-6">
        <h2 className="text-2xl font-bold mb-2">⚔️ Equipped Deck ({activeDeck.length}/30)</h2>
        {render_deck(activeDeck, handleDrop('active'))}
      </div>

      {/* filter/sort Bar */}
      <div className="flex gap-4 mb-4 items-center">
        <div className="flex items-center gap-2">
          <Filter /> 
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-black/40 border border-white/10 rounded p-1">
            <option value="all">All</option>
            <option value="fire">Fire</option>
            <option value="water">Water</option>
            <option value="ice">Ice</option>
            <option value="air">Air</option>
            <option value="earth">Earth</option>
          </select>
        </div>
        <button onClick={() => setSortAsc(!sortAsc)} className="flex items-center gap-1 bg-black/40 px-3 py-1 rounded border border-white/10">
          <SortAsc /> Sort {sortAsc ? '↑' : '↓'}
        </button>
      </div>

      {/* full Inventory */}
      <div className="max-w-8xl mx-auto mb-6">
        <h2 className="text-2xl font-bold mb-2">🎒 Remaining Inventory ({inventory.length})</h2>
        {render_deck(filteredInventory, handleDrop('inventory'))}
      </div>
    </div>
  );
};
export default InventoryManager;