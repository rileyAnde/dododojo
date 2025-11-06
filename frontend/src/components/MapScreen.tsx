import React, { useState } from 'react';
import { Swords, X } from 'lucide-react';

interface MapScreenProps {
  onReturnHome?: () => void;
  onEnterBattle?: (element: string) => void;
}  

interface Gym {
  id: string;
  name: string;
  element: string;
  x: number; // 0-100 (% from left)
  y: number; // 0-100 (% from top)
}

const MapScreen: React.FC<MapScreenProps> = ({ onReturnHome, onEnterBattle }) => {
    const [selectedGym, setSelectedGym] = useState<Gym | null>(null);

    //define gyms and locations 
    //adjust x y coords as needed
    const gyms: Gym[] = [
    {
      id: 'fire-dojo',
      name: 'Fire Dojo',
      element: 'fire',
      x: 20,
      y: 30
    },
    {
      id: 'water-temple',
      name: 'Water Temple',
      element: 'water',
      x: 50,
      y: 45
    },
    {
      id: 'ice-fortress',
      name: 'Ice Fortress',
      element: 'ice',
      x: 75,
      y: 25
    },
    {
      id: 'earth-shrine',
      name: 'Earth Shrine',
      element: 'earth',
      x: 30,
      y: 65
    },
    {
      id: 'air-peak',
      name: 'Air Peak',
      element: 'air',
      x: 65,
      y: 70
    }
  ];
  const getElementColor = (element: string) => {
    switch (element) {
      case 'fire': return 'from-red-500 to-orange-500';
      case 'water': return 'from-blue-500 to-cyan-500';
      case 'ice': return 'from-cyan-300 to-blue-300';
      case 'air': return 'from-gray-300 to-slate-400';
      case 'earth': return 'from-green-600 to-emerald-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

    const handleGymClick = (gym: Gym) => {
        setSelectedGym(gym);
    };

    const handleEnterBattle = () => {
        if (selectedGym && onEnterBattle) {
        onEnterBattle(selectedGym.element);
        }
    };

return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-4 border border-white border-opacity-20">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Swords className="text-cyan-400" size={32} />
              Card Jitsu World Map
            </h1>
            <button
              onClick={onReturnHome}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              Return to Dojo
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="max-w-6xl mx-auto">
        <div className="relative bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 border border-white border-opacity-20">
          {/* Map Image - replace with your actual map */}
          <div className="relative w-full aspect-video bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-2xl overflow-hidden">
            {/* Replace this div with your actual map image */}
            <img 
              src="/map.png" 
              alt="Card Jitsu World Map"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            
            {/* fallback background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 bg-red-500 rounded-full blur-3xl"></div>
              <div className="absolute top-20 right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-cyan-400 rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 right-1/4 w-32 h-32 bg-green-500 rounded-full blur-3xl"></div>
            </div>

            {/* gyms positioned based on x/y percentages */}
            {gyms.map((gym) => (
              <button
                key={gym.id}
                onClick={() => handleGymClick(gym)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br ${getElementColor(gym.element)} rounded-full border-4 border-white shadow-2xl hover:scale-125 transition duration-200 flex items-center justify-center cursor-pointer group`}
                style={{ left: `${gym.x}%`, top: `${gym.y}%` }}
              >
                
                {/* on hover */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block">
                  <div className="bg-black bg-opacity-90 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
                    {gym.name}
                  </div>
                </div>
              </button>
            ))}
          </div>

        {/*instructions*/}
          <div className="mt-6 text-center text-white">
            <p className="text-lg">Click on a gym to challenge its master!</p>
          </div>
        </div>
      </div>

      {/* Gym Details Modal */}
      {selectedGym && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md w-full border-4 border-white shadow-2xl relative">
            {/* Close button */}
            <button
              onClick={() => setSelectedGym(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
            >
              <X size={32} />
            </button>

            {/* Gym header */}
            <div className={`w-24 h-24 mx-auto mb-6 bg-gradient-to-br ${getElementColor(selectedGym.element)} rounded-full flex items-center justify-center border-4 border-white shadow-xl`}/>

            <h2 className="text-3xl font-bold text-white text-center mb-2">
              {selectedGym.name}
            </h2>

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedGym(null)}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEnterBattle}
                className={`flex-1 px-6 py-3 bg-gradient-to-r ${getElementColor(selectedGym.element)} text-white rounded-xl font-bold hover:scale-105 transition shadow-lg`}
              >
                Enter Battle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapScreen;