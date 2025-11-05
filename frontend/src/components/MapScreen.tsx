import React from 'react';
import { Swords } from 'lucide-react';

interface MapScreenProps {
  onReturnHome?: () => void;
  onEnterBattle?: () => void;
}

const MapScreen: React.FC<MapScreenProps> = ({ onReturnHome, onEnterBattle }) => {

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800 p-6">
      {/* Header */}
        <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-4 border border-white border-opacity-20">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Swords className="text-cyan-400" size={32} />
                    Dodo Dojo World Map
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
                    alt="Dodo Dojo World Map"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback if image doesn't exist
                        e.currentTarget.style.display = 'none';
                    }} />
                    {/* Fallback decorative background if image doesn't load */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-red-500 rounded-full blur-3xl"></div>
                        <div className="absolute top-20 right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-cyan-400 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 right-1/4 w-32 h-32 bg-green-500 rounded-full blur-3xl"></div>
                    </div>
                </div>
            <button className="bg-white" onClick={onEnterBattle} >
                Enter Battle
            </button>
            </div>
        </div>
    </div>
    )}
 

export default MapScreen;