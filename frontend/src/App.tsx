/*
Functions: 
handleLogin -> validate input and attempts to fetch user from the backend
handleSignUp -> validate input and call API to create a new user
handleLogout -> clear user session and show the login screen
handleDeleteAccount -> prompt for confirmation, remove user from state, reset application to login screen
Inputs: None
Outputs: the DOM tree that React will render to the browser
Outside Sources: minor ChatGPT and Github Copilot
Authors: Riley Anderson, Colin Treanor, Dusin Le, Hannah Smith
Creation Date: 10/20/2025
*/


import React, { useState } from 'react';
import { Swords, Map, Users } from 'lucide-react';
import DodoCharacter from './components/character';
import BattleScreen from './components/BattleScreen';
import MapScreen from './components/MapScreen';
import Inventory from './components/Inventory'
import { Card } from './game/battle';
import { create_user, delete_user, get_user } from './actions/userActions';

// Define the posible screens users can view
type Page = 'login' | 'signup' | 'home' | 'battle' | 'map' | 'inventory';

// Define the structure of a player object
export interface User {
    id: number;
    username: string;
    password: string;
    level: number;
    inventory: Card[];  
    primaryDeck: Card[]; 
    gymsOwned: string[];
    penguinColor?: string
    dodoType?: string
    
}

/* 
Main container for the application. This handles the following
- global state
- authentication logic
- conditional rendering of the screens 
*/
const CardJitsuGame: React.FC = () => {
  // State management

  // State for which screen is currently visible
  const [currentPage, setCurrentPage] = useState<Page>('login');
  // State to hold current user
  const [user, setUser] = useState<User | undefined>(undefined);
  // State to hold login/signup info
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // State to store local history of accounts
  const [accounts, setAccounts] = useState<User[]>([]);
  // Game states
  const [selectedGym, setSelectedGym] = useState<string>('fire');
  const [conqueredGyms, setConqueredGyms] = useState<Set<string>>(new Set());
 
  /* Function to deal with a user login
  - on success: set the user state and display home page
  - on fail: alert user and clear password
  */
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {//works
      alert('Please enter a username and password.');
      setPassword("")
      return;
    }

    try{
      const new_user = await get_user(username, password)
      console.log(new_user)
      setUser(new_user)
      setCurrentPage('home')
    }catch(e: any){
        setPassword("")
        alert('Invalid Login')
        return;
    }
  };

  // Function to handle a new user sign up
  const handleSignUp = async () => {
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) { 
      alert('Please fill out the fields!');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    let createdUser: User |undefined
    try{
      createdUser  = await create_user(username.trim(), password.trim())
      if (!createdUser){
        throw new Error('User creation failed')
      }
    }catch (err){
      alert("Issue please try again")
      return;
    }

    // randomize character
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    const types = ['fire', 'air', 'water', 'earth', 'ice', 'default', 'jay']
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomType = types[Math.floor(Math.random() * types.length)]

    // create the user
    const newUser: User = {
    ...createdUser,
    username: createdUser.username, // or username.trim()
    password: password.trim(),
    level: createdUser.level ?? 1,
    penguinColor: randomColor,
    dodoType: randomType,
    };

    console.log('Users Registered:', [...accounts, newUser]);
    setUser(newUser);
    setCurrentPage('home')
  };

  /* Function to log out the user
  - will clear the current session data and show the login page
  */
  const handleLogout = () => { 
    setUser(undefined);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setCurrentPage('login'); //back to the beginning
  };

  //did you forget your password? click this button to do a simple reset!
  // save til sprint 3
// const handleForgotPassword = () => {
//     if (!username.trim()) {
//       alert('Please enter your username to continue!');
//       return;
//     }

//     const existingUser = accounts.find(acc => acc.username === username.trim());
//     if (!existingUser) { //user doesn't exist
//       alert('No user found!');
//       return;
//     }

//     const newPassword = prompt('Enter a new password:');
//     if (!newPassword) { //no password entered
//       alert('Password not reset!');
//       return;
//     }

//     setAccounts( //password reset!
//       accounts.map(acc =>
//         acc.username === username.trim()
//           ? { ...acc, password: newPassword.trim() }
//           : acc
//       )
//     );

//     alert('Password successfully reset! Head back to the login to play!');
//     setPassword('');
//   };

  /* Handle deleting a users account
  - prompt for confirmation, then show login screen
  */
  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete your account? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    const updatedAccounts = accounts.filter(acc => acc.username !== user.username);
    setAccounts(updatedAccounts);

    alert('Account deleted! Returning to the login page....');
    setUser(undefined);
    setUsername('');
    setPassword('');
    setCurrentPage('login');
  };


  // Conditional Rendering 

  /* Display the battle screen
  - when a user enters a battle, render this component which handles battle logic
  */ 
  if (currentPage === 'battle') {
    return (
      <BattleScreen 
        onReturnHome={() => setCurrentPage('map')}
        playerName={user?.username} 
        gymElement={selectedGym}
        onVictory={(element) => {
          setConqueredGyms(prev => new Set(prev).add(element));
          }}
        />
    );
  }

  /* Display inventory screen
  - display the users cards and allow them to manage their deck
  */
  if (currentPage === 'inventory') {
    console.log(user?.username)
    return (
      <Inventory onReturnHome={() => setCurrentPage('home')}
      cur_user={user} />
    )
  }

  /* Display the map
  - show the map and allow user to select gyms and encounter battles
  */
  if (currentPage === 'map') {
    return (
      <MapScreen 
        onReturnHome={() => setCurrentPage('home')}
        onEnterBattle={(element) => {
          setSelectedGym(element);
          setCurrentPage('battle');
        }}
        playerName={user?.username}
        conqueredGyms={conqueredGyms}
      />
    );
  }

  /*Display login screen
  - entry point of the app, contains login form 
  */
  if (currentPage === 'login') {
    // may need a way to log what user logins have been made!
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 flex items-center justify-center p-4">
        {/* background animations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute bottom-40 right-20 w-48 h-48 bg-white rounded-full opacity-5 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full opacity-10"></div>
        </div>
        {/* login form container */}
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full mb-4">
              <Swords size={48} />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Dodo Dojo</h1>
          </div>

          <div className="space-y-6">
            <div>
              <div className="block text-sm font-medium text-red-700 mb-2">
                Username
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <div className="block text-sm font-medium text-blue-700 mb-2">
                Password
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter password"
              />
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition duration-200 shadow-lg"
            >
              Enter the Dojo
            </button>
            
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => setCurrentPage('signup')}
                className="text-pink-600 hover:text-yellow-700 font-semibold"
              >
                Sign up here!
              </button>
              
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Display signup screen
  if (currentPage === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-yellow-700 to-green-500 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-500 to-green-500 text-white p-4 rounded-full mb-4">
              <Users size={48} />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Player Registration!</h1>
          </div>

          <div className="space-y-6">
            <div>
              <div className="block text-sm font-medium text-red-700 mb-2">
                Username
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Create a username!"
              />
            </div>

            <div>
              <div className="block text-sm font-medium text-blue-700 mb-2">
                Password
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Create a secure password!"
              />
            </div>
            <div>
              <div className="block text-sm font-medium text-yellow-700 mb-2">
                Re-enter Password
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Re-enter your password!"
              />
            </div>

            <button //signup button
              onClick={handleSignUp}
              className="w-full bg-gradient-to-r from-yellow-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600  transform hover:scale-105 transition duration-200 shadow-lg"
            >
              Confirm sign up
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account with Dodo Dojo?{' '}
              <button
                onClick={() => setCurrentPage('login')}
                className="text-red-600 hover:text-blue-700 font-semibold"
              >
                Click here!
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*Display the home page
  - show users character, map button, inventory button
  */
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-900 to-blue-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400 rounded-full opacity-10 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-40 right-20 w-96 h-96 bg-purple-400 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-400 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      {/* Top bar */}
      <div className="relative z-10 bg-black bg-opacity-30 backdrop-blur-sm border-b border-white border-opacity-20">
        <div className="container mx-auto px-6 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Swords className="text-cyan-400" size={32} />
            <h1 className="text-2xl font-bold text-white">Welcome to your home dojo</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-white">
              <span className="text-cyan-400 font-semibold">{user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
            >
              Logout
            </button>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg transition"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Character display */}
          <div className="lg:col-span-2">
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">{user?.username || "player1"}</h2>

              <div className="flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center py-1">
                  <DodoCharacter
                    type={user?.dodoType || 'jay'}
                    size="large"
                    flipped='n'
                  />
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-bold text-white mb-1">{user?.username}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-4">
            <button onClick={() => setCurrentPage('inventory')} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white p-6 rounded-2xl shadow-xl transform hover:scale-105 transition duration-200 border border-white border-opacity-20">
              <div className="flex items-center justify-center gap-4">
                <Swords size={32} />
                <div className="text-left">
                  <div className="font-bold text-lg">View Deck</div>
                  <div className="text-sm text-cyan-100">Manage your cards</div>
                </div>
              </div>
            </button>

            <button onClick={() => setCurrentPage('map')} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-6 rounded-2xl shadow-xl transform hover:scale-105 transition duration-200 border border-white border-opacity-20">
              <div className="flex items-center justify-center gap-4">
                <Map size={32} />
                <div className="text-left">
                  <div className="font-bold text-lg">Map</div>
                  <div className="text-sm text-purple-100">Explore locations</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardJitsuGame;