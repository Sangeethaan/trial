import './App.css'
import ChatWindow from './ChatWindow';
import SideBar from './SideBar';
import Auth from './Auth';
import About from './About';
import { MyContext } from './MyContext';
import { AuthProvider, useAuth } from './AuthContext';
import { useState } from 'react';
import {v1 as uuidv1} from 'uuid';

function AppContent() {
  const { user, loading } = useAuth();
  let [prompt , setPrompt] = useState("");
  let [reply , setReply] = useState(null);
  let [currThreadId, setCurrThreadId] = useState(uuidv1());
  let [prevChats , setPrevChats] = useState([]);
  let [newChat , setNewChat] = useState(true);
  let [allThreads , setAllThreads] = useState([]);
  let [showAuth, setShowAuth] = useState(false);
  let [showAbout, setShowAbout] = useState(false);
  let [guestMode, setGuestMode] = useState(!user && !showAuth);

  const providerValues = {
    prompt , setPrompt,
    reply , setReply,
    currThreadId , setCurrThreadId,
    prevChats , setPrevChats,
    newChat , setNewChat,
    allThreads , setAllThreads,
    showAuth, setShowAuth,
    showAbout, setShowAbout,
    guestMode, setGuestMode
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (showAbout) {
    return (
      <MyContext.Provider value={providerValues}>
        <About />
      </MyContext.Provider>
    );
  }

  if (showAuth) {
    return (
      <MyContext.Provider value={providerValues}>
        <Auth />
      </MyContext.Provider>
    );
  }

  // Guest mode or authenticated user
  return (
    <div className='app'>
      <MyContext.Provider value={providerValues}>
        {user && <SideBar />}
        <ChatWindow />
      </MyContext.Provider>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App