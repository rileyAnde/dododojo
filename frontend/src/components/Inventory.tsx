import React, { useState, useEffect } from 'react';
import { Card } from '../game/battle';
import { generateEnemyDeck } from '../game/deckGenerator';
import { loadCardsFromXML } from '../utils/cardLoader';

interface Inventory {
  onReturnHome?: () => void;
  playerName?: string;
}
//temp for displaying
const cards = await loadCardsFromXML();

const InventoryManager: React.FC<Inventory> = ({ onReturnHome, playerName: propPlayerName }) => {
    const [playerName] = useState(propPlayerName || 'Player1');

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

    const render_deck = (cards: Card[]) => {
    
        return (
            <div className="flex gap-2">
                <div className="flex flex-wrap items-center gap-4">
                    {cards.map((card) => (
                        <div key={card.id}>
                            <CardDisplay card={card} size="small" />
                        </div>
                    ))}
                </div>
            </div>
    )}
        

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
                        </div>
                        <button onClick={onReturnHome || (() => window.location.reload())} className="px-8 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold text-xl hover:scale-105 transition">
                            Return to Dojo
                        </button>
                    </div>
                </div>
            </div>
            {/* currently equipped block */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-4 border border-white border-opacity-20">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col items-start gap-2">
                            <div className="flex items-center gap-3">
                                <div>
                                    {render_deck(generateEnemyDeck(cards, 'fire', 30, 0.6))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default InventoryManager;