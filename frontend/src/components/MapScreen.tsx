import React, { useState } from 'react';
import { Swords, X } from 'lucide-react';

interface MapScreenProps {
  onReturnHome?: () => void;
  onEnterBattle?: (element: string) => void;
  playerName?: string;
  conqueredGyms?: Set<string>;
}

interface Gym {
  id: string;
  name: string;
  element: 'fire' | 'water' | 'ice' | 'earth' | 'air';
  x: number; // percent from left edge of the map image
  y: number; // percent from top edge of the map image
  icon: string; // public path to placeholder image
}

const MapScreen: React.FC<MapScreenProps> = ({ onReturnHome, onEnterBattle, playerName = 'Player', conqueredGyms = new Set() }) => {
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [showAdvantage, setShowAdvantage] = useState(false);

  // Coordinates tuned for your parchment:
  // FIRE is lined up on the lava section near the bottom-center.
  // Adjust numbers live if you want finer placement.
  const gyms: Gym[] = [
    { id: 'fire-dojo', name: 'Fire Dojo', element: 'fire', x: 55, y: 76, icon: '/fire_placeholder.png' },
    { id: 'water-temple', name: 'Water Temple', element: 'water', x: 55, y: 18, icon: '/water_placeholder.png' },
    { id: 'ice-fortress', name: 'Ice Fortress', element: 'ice', x: 84, y: 48, icon: '/ice_placeholder.png' },
    { id: 'earth-shrine', name: 'Earth Shrine', element: 'earth', x: 22, y: 57, icon: '/earth_placeholder.png' },
    { id: 'air-peak', name: 'Air Peak', element: 'air', x: 25, y: 18, icon: '/air_placeholder.png' },
  ];

  // here are the encounter icons --images will be updated later!
  const elements = [
    { id: 'fire', icon: '/fire.png' },
    { id: 'water', icon: '/water.png' },
    { id: 'ice', icon: '/ice.png' },
    { id: 'earth', icon: '/earth.png' },
    { id: 'air', icon: '/air.png' },
  ];
  // Generate multiple encounters near each of the dojo -- need to make sure this does not mark the main dojo as defended
  const generateEncounters = () => { 
    return gyms.map((gym) => {

      const random = Math.floor(Math.random() * elements.length);
      const chosen = elements[random];

      // Slight random offset
      const offsetX = (Math.random() * 8) - 4; // -4% to +4%
      const offsetY = (Math.random() * 8) - 4;
      // const rawX = gym.x + offsetX;
      // const rawY = gym.y + offsetY;

      return {
        id: `${chosen.id}-${gym.id}-${Math.random().toString(36).slice(2)}`,
        element: chosen.id,
        icon: chosen.icon,
        x: gym.x + offsetX,
        y: gym.y + offsetY,
      };
    });
  };
  const pullTowardCenter = (x: number, y: number, factor = 0.4) => {
    // Center of map to put the encounter sprites in, not perfect but relatively close!
    const centerX = 50;
    const centerY = 40;

    return {
      x: x + (centerX - x) * factor,
      y: y + (centerY - y) * factor,
    };
  };
  const [encounters, setEncounters] = useState(generateEncounters);

  const handleGymClick = (gym: Gym) => setSelectedGym(gym);

  const handleEnterBattle = () => {
    if (selectedGym && onEnterBattle) onEnterBattle(selectedGym.element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Swords className="text-cyan-400" size={32} />
              Card Jitsu World Map
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAdvantage(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
              >

                Element Advantages
              </button>
              <button
                onClick={onReturnHome}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
              >
                Return to Dojo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="max-w-6xl mx-auto">
        <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden">
            {/* parchment background from /public */}
            <img
              src="/map.png"
              alt="Element Map"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Clickable dojo placeholders */}
            {gyms.map((gym) => (
              <button
                key={gym.id}
                onClick={() => handleGymClick(gym)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition duration-200 group"
                style={{ left: `${gym.x}%`, top: `${gym.y}%` }}
                aria-label={gym.name}
                title={gym.name}
              >
                <img
                  src={gym.icon}
                  alt={gym.name}
                  className="w-20 h-20 object-contain drop-shadow-lg"
                />
                {/* Hover label */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block">
                  <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
                    {gym.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {/* random encounter sprite in center zone--let's try putting multiple random sprites at one time and near their respective dojo 
          Also need a way to make sure the sprite encounter doesn't mark the main dojo as defeated--should just remove */}
          {/* {encounter && (
            <div
              className="absolute cursor-pointer hover:scale-125 transition duration-300"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => onEnterBattle && onEnterBattle(encounter.id)}
              title={`Encounter: ${encounter.id.toUpperCase()}`}
            >
              <img
                src={encounter.icon}
                alt={`${encounter.id} encounter`}
                className="w-24 h-24 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]"
              />
            </div>
          )} */}
          {/* MULTIPLE encounter sprites */}
          {encounters.map((enc) => { // here is how the current sprite randomization occurs
            const pulled = pullTowardCenter(enc.x, enc.y, 0.6);

            return (
              <div
                key={enc.id}
                className="absolute cursor-pointer hover:scale-125 transition duration-300"
                style={{
                  left: `${pulled.x}%`,
                  top: `${pulled.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 20,
                }}
                onClick={() => onEnterBattle && onEnterBattle(`encounter:${enc.element}`)}
              >
                <img src={enc.icon} className="w-20 h-20" />
              </div>
            );
          })}



          {/* instructions */}
          <div className="mt-6 text-center text-white">
            <p className="text-lg">Click on a dojo to challenge its master!</p>
          </div>
        </div>
      </div>

      {/* Gym Details Modal */}
      {selectedGym && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md w-full border-4 border-white shadow-2xl relative">

            <p className="text-center text-cyan-300 mb-4">
              Defended by: <span className="font-bold text-yellow-400">
                {conqueredGyms.has(selectedGym.element)
                  ? playerName
                  : `Sensei ${selectedGym.element.charAt(0).toUpperCase() + selectedGym.element.slice(1)}`}
              </span>
            </p>

            <button
              onClick={() => setSelectedGym(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
            >
              <X size={32} />
            </button>

            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center border-4 border-white shadow-xl bg-black/40">
              <img
                src={selectedGym.icon}
                alt={selectedGym.name}
                className="w-20 h-20 object-contain"
              />
            </div>

            <h2 className="text-3xl font-bold text-white text-center mb-2">
              {selectedGym.name}
            </h2>

            <div className="flex gap-4">
              <button
                onClick={() => setSelectedGym(null)}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEnterBattle}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold hover:scale-105 transition shadow-lg"
              >
                Enter Battle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advantage chart modal */}
      {showAdvantage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-blue-600 via-gray-400 to-red-500 rounded-3xl p-6 max-w-2xl w-full border-4 border-white shadow-2xl relative backdrop-blur-sm">
            <button
              onClick={() => setShowAdvantage(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
            >
              <X size={28} />
            </button>
            <h2 className="text-3xl font-bold text-white text-center mb-4">Element Advantages</h2>
            <div className="flex justify-center">
              <img
                src="/advantage.png"
                alt="Element Advantage Chart"
                className="rounded-2xl border border-white/30 shadow-lg max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapScreen;
