import './App.css'
import ChatWindow from './ChatWindow';
import SideBar from './SideBar';
import { MyContext } from './MyContext';
import { useState } from 'react';
import {v1 as uuidv1} from 'uuid';

function App() {
  let [prompt , setPrompt] = useState("");
  let [reply , setReply] = useState(null);
  let [currThreadId, setCurrThreadId] = useState(uuidv1());
  let [prevChats , setPrevChats] = useState([]);
  let [newChat , setNewChat] = useState(true);
  let [allThreads , setAllThreads] = useState([]);

  const providerValues = {
    prompt , setPrompt,
    reply , setReply,
    currThreadId , setCurrThreadId,
    prevChats , setPrevChats,
    newChat , setNewChat,
    allThreads , setAllThreads
  }; //passing values
  
  return (
    <div className='app'>
      <MyContext.Provider value={providerValues}>
        <SideBar></SideBar>
        <ChatWindow></ChatWindow>
      </MyContext.Provider>
    </div>
  )
}

export default App
